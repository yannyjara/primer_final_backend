const db = require("../models");
// const PDFDocument = require("pdfkit");
const { datosDetalleConsumo } = require("./detalleConsumoDAO.controller");
const consumos = db.consumoCabecera;
const reserva = db.reserva;
const mesa = db.mesa;
const cliente = db.cliente;
const restaurante = db.restaurante;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const { PDFDocument, StandardFonts, rgb } = require ('pdf-lib')
exports.create = async (req, res) => {
  const { mesaId, restauranteConsumoId, clienteConsumoCedula } = req.body;
  if (!mesaId || !restauranteConsumoId || !clienteConsumoCedula) {
    res.status(400).send({
      message:
        "Para abrir un consumo debe seleccionar una mesa, restaurante y cliente!",
    });
    return;
  }

  try {
    const datos_mesa = await mesa.findOne({
      where: { id: mesaId, restauranteId: restauranteConsumoId },
    });

    if (!datos_mesa) {
      throw new Error("Mesa no encontrada");
    }
    const datos_cliente = await cliente.findOne({
      where: { cedula: clienteConsumoCedula },
    });

    if (!datos_cliente) {
      throw new Error("Cliente no encontrado");
    }
    const ocupado = true;
    db.mesa.update({ ocupado }, { where: { id: mesaId } });

    const request = {
      mesaId,
      restauranteConsumoId,
      clienteConsumoCedula: datos_cliente.dataValues.cedula,
      estado: "abierto",
    };

    const datos_consumo_cabecera = await consumos.create(request);

    if (datos_consumo_cabecera) {
      res.send(datos_consumo_cabecera);
    } else {
      throw new Error("Error al crear el consumo.");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Error al obtener o crear el consumo.",
    });
  }
};

exports.cambiarCliente = async (req, res) => {
  const { clienteConsumoCedula } = req.body;
  const id = req.params.id;

  if (!clienteConsumoCedula) {
    res.status(400).send({
      message: "Para cambiar un consumo, se requiere el CI del nuevo cliente.",
    });
    return;
  }

  try {
    const numRowsAffected = await consumos.update(
      { clienteConsumoCedula },
      { where: { id } }
    );

    if (numRowsAffected == 1) {
      res.send({
        message: "Cabecera actualizada correctamente.",
      });
    } else {
      throw new Error("No se pudo actualizar la cabecera");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: `Error al actualizar la cabecera con id=${id}.`,
    });
  }
};

exports.cerrarConsumo = async (req, res) => {
  const id = req.params.id;
  const estado = "cerrado";
  const fechaHoraCierre = new Date().toLocaleString();

  try {
    const numRowsAffected = await consumos.update(
      { estado, fechaHoraCierre },
      { where: { id } }
    );

    if (numRowsAffected == 1) {
      const {
        fechaHoraCreacion,
        fechaHoraCierre,
        clienteConsumoCedula,
        mesaId,
      } = await this.datosConsumoCabecera(id);

      const datos_cliente = await db.cliente.findOne({
        where: { cedula: clienteConsumoCedula },
      });

      const datos_detalles = await datosDetalleConsumo(id);

      const totalPromises = datos_detalles.map(async (detalle) => {
        const productoId = detalle.productoId;
        const producto = await db.productos.findOne({
          where: { id: productoId },
        });
        const precio = producto.precio;
        return detalle.cantidad * precio;
      });

      const precios = await Promise.all(totalPromises);
      const total = precios.reduce((acc, precio) => acc + precio, 0);

      await db.mesa.update({ ocupado: false }, { where: { id: mesaId } });
      await consumos.update({ total }, { where: { id } });

      if (datos_cliente && datos_detalles && total) {
        const datos_consumo = {};
        datos_consumo.cabecera = {
          id,
          fechaHoraCreacion,
          fechaHoraCierre,
        };
        datos_consumo.cliente = {
          cedula: datos_cliente.cedula,
          nombre: datos_cliente.nombre,
          apellido: datos_cliente.apellido,
        };
        datos_consumo.detalles = datos_detalles.map((detalle) => ({
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
        }));
        datos_consumo.total = total;

        /*const pdf = generarPDF(datos_consumo, res);
        res.setHeader("Content-Type", "application/pdf");
        pdf.pipe(res);
        pdf.end();*/
        let pdf = await createPdf(datos_consumo);
        const data = {
          datos_consumo: datos_consumo,
          pdf: pdf
        }

        return res.send(data);
      } else {
        throw new Error("No hay datos suficientes");
      }
    } else {
      throw new Error("No se encontró la cabecera");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Error al cerrar el consumo.",
    });
  }
};

exports.datosConsumoCabecera = async (consumo_cabecera_id) => {
  if (!consumo_cabecera_id) {
    return;
  }
  const datos_consumo_cabecera = await consumos.findOne({
    where: { id: consumo_cabecera_id },
  });
  return datos_consumo_cabecera;
};

exports.obtenerConsumo = async (req, res) => {
  const mesaId = req.body.mesaId;
  const data = {};
  const datos_mesa = await db.mesa.findOne({ where: { id: mesaId } });
  if (datos_mesa.ocupado) {
    const datos_consumo_cabecera = await consumos.findOne({
      where: { mesaId, estado: "abierto" },
    });

    data.detalles = await datosDetalleConsumo(
      datos_consumo_cabecera.dataValues.id
    );

    data.cabecera = datos_consumo_cabecera;

    return res.send(data);
  } else return res.send(null);
};

exports.obtenerConsumo2 = async (req, res) => {
  const mesaId = req.body.mesaId;
  const data = {};
  
  try {
    const datos_mesa = await db.mesa.findOne({ where: { id: mesaId } });
    if (datos_mesa.ocupado) {
      const datos_consumo_cabecera = await sequelize.query(
        `SELECT cc.id, cc.estado, cc."fechaHoraCreacion", cc."fechaHoraCierre", cc.total, cc."mesaId", cc."restauranteConsumoId", cc."clienteConsumoCedula",
          CONCAT(c.nombre, ' ', c.apellido) as nombreCliente
         FROM consumo_cabeceras cc
         JOIN clientes c ON c.cedula = cc."clienteConsumoCedula"
         WHERE cc.estado = 'abierto' AND cc."mesaId" = :mesaId`,
        {
          replacements: { mesaId },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (datos_consumo_cabecera.length > 0) {
        const consumoCabeceraId = datos_consumo_cabecera[0].id;

        // Query manual para obtener detalles del consumo con información del producto
        const detalles = await sequelize.query(
          `SELECT dc.id, dc.cantidad, dc."consumoCabeceraId", dc."productoId", p.nombre AS productoNombre, p.precio
          FROM detalle_consumos dc
          JOIN productos p ON dc."productoId" = p.id
          WHERE dc."consumoCabeceraId" = :consumoCabeceraId`,
          {
            replacements: { consumoCabeceraId },
            type: sequelize.QueryTypes.SELECT
          }
        );

        data.detalles = detalles;
        data.cabecera = datos_consumo_cabecera[0];
      } else {
        data.detalles = [];
        data.cabecera = null;
      }

      return res.send(data);
    } else {
      return res.send(null);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Error al obtener el consumo.",
    });
  }
};

async function createPdf(datos_consumo) {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;
  const margin = 50;
  const lineHeight = fontSize + 2;

  const fechaHoraCierre = new Date(datos_consumo.cabecera.fechaHoraCierre);
  const dia = fechaHoraCierre.getDate();
  const mes = fechaHoraCierre.getMonth() + 1; // Los meses en JavaScript comienzan desde 0
  const anio = fechaHoraCierre.getFullYear();
  const hora = fechaHoraCierre.getHours();
  const minutos = fechaHoraCierre.getMinutes();
  const segundos = fechaHoraCierre.getSeconds();
  const fechaHoraFormateada = `${dia < 10 ? '0' + dia : dia}-${mes < 10 ? '0' + mes : mes}-${anio} ${hora < 10 ? '0' + hora : hora}:${minutos < 10 ? '0' + minutos : minutos}:${segundos < 10 ? '0' + segundos : segundos}`;

  let yPosition = height - margin;

  // Draw header
  page.drawText('Factura', {
    x: margin,
    y: yPosition,
    size: fontSize + 4,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= lineHeight * 2;

  // Draw client info
  page.drawText(`Nombre: ${datos_consumo.cliente.nombre} ${datos_consumo.cliente.apellido}`, {
    x: margin,
    y: yPosition,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= lineHeight;

  page.drawText(`Cédula: ${datos_consumo.cliente.cedula}`, {
    x: margin,
    y: yPosition,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= lineHeight;

  page.drawText(`Fecha: ${fechaHoraFormateada}`, {
    x: margin,
    y: yPosition,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= lineHeight * 2;

  // Draw table headers
  page.drawText('Producto', {
    x: margin,
    y: yPosition,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('Cantidad', {
    x: margin + 200,
    y: yPosition,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('Precio Unitario', {
    x: margin + 300,
    y: yPosition,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('Precio Total', {
    x: margin + 450,
    y: yPosition,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= lineHeight;

  // Draw table rows
  for (const detalle of datos_consumo.detalles) {
    const producto = await db.productos.findOne({
      where: { id: detalle.productoId },
    });

    const precioUnitario = parseFloat(producto.precio).toLocaleString("es-PY");
    const precioTotal = (detalle.cantidad * producto.precio).toLocaleString("es-PY");

    page.drawText(producto.nombre, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(detalle.cantidad.toString(), {
      x: margin + 200,
      y: yPosition,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(precioUnitario, {
      x: margin + 300,
      y: yPosition,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(precioTotal, {
      x: margin + 450,
      y: yPosition,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= lineHeight;
  }

  yPosition -= lineHeight;

  // Draw total
  page.drawText(`Total: ${datos_consumo.total.toLocaleString("es-PY")}`, {
    x: margin,
    y: yPosition,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.saveAsBase64();
  return pdfBytes;
}

