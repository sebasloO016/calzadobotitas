const Kardex = require('../models/kardexModel');

exports.verKardexPage = (req, res) => {
    const codigo = (req.query.codigo || '').trim();
    const VarianteID = req.query.varianteId ? Number(req.query.varianteId) : null;
    const desde = req.query.desde || '';
    const hasta = req.query.hasta || '';

    // Página inicial sin buscar
    if (!codigo && !VarianteID) {
        return res.render('kardex/verKardex', {
            codigo: '',
            variantes: [],
            varianteInfo: null,
            movimientos: [],
            desde,
            hasta,
            error: null
        });
    }

    // Si viene VarianteID directo, mostrar kardex de esa variante
    if (VarianteID) {
        return cargarKardexVariante(VarianteID, desde, hasta, res, codigo, []);
    }

    // Si viene código, listar variantes para elegir
    Kardex.getVariantesByCodigo(codigo, (err, variantes) => {
        if (err) {
            console.error(err);
            return res.render('kardex/verKardex', {
                codigo,
                variantes: [],
                varianteInfo: null,
                movimientos: [],
                desde,
                hasta,
                error: 'Error al buscar variantes'
            });
        }

        // si hay 1 sola variante, mostrarla directo
        if (variantes.length === 1) {
            return cargarKardexVariante(variantes[0].VarianteID, desde, hasta, res, codigo, variantes);
        }

        // si hay varias, solo listar y esperar selección
        res.render('kardex/verKardex', {
            codigo,
            variantes,
            varianteInfo: null,
            movimientos: [],
            desde,
            hasta,
            error: variantes.length ? null : 'No se encontraron variantes para ese código'
        });
    });
};

exports.verKardexVariante = (req, res) => {
    const VarianteID = Number(req.params.id);
    const desde = req.query.desde || '';
    const hasta = req.query.hasta || '';
    cargarKardexVariante(VarianteID, desde, hasta, res, '', []);
};

function cargarKardexVariante(VarianteID, desde, hasta, res, codigo, variantes) {

    // 1️⃣ Información de la variante
    Kardex.getInfoVariante(VarianteID, (err, info) => {
        if (err || !info) {
            return res.render('kardex/verKardex', {
                codigo,
                variantes,
                varianteInfo: null,
                movimientos: [],
                desde,
                hasta,
                saldoInicial: 0,
                totalEntradas: 0,
                totalSalidas: 0,
                error: 'Variante no encontrada'
            });
        }

        // 2️⃣ Movimientos del período
        Kardex.getKardexByVariante(VarianteID, desde, hasta, (err, movimientos) => {
            if (err) {
                return res.render('kardex/verKardex', {
                    codigo,
                    variantes,
                    varianteInfo: info,
                    movimientos: [],
                    desde,
                    hasta,
                    saldoInicial: 0,
                    totalEntradas: 0,
                    totalSalidas: 0,
                    error: 'Error al cargar kardex'
                });
            }

            // 3️⃣ Saldo inicial
            Kardex.getSaldoInicial(VarianteID, desde, (err, saldoInicial) => {
                if (err) {
                    return res.status(500).send('Error al calcular saldo inicial');
                }

                // 4️⃣ Totales del período
                Kardex.getTotalesPeriodo(VarianteID, desde, hasta, (err, totales) => {
                    if (err) {
                        return res.status(500).send('Error al calcular totales');
                    }

                    // 5️⃣ Render FINAL (una sola vez)
                    res.render('kardex/verKardex', {
                        codigo: info.Codigo,
                        variantes,
                        varianteInfo: info,
                        movimientos: movimientos || [],
                        desde,
                        hasta,
                        saldoInicial,
                        totalEntradas: totales[0]?.Entradas || 0,
                        totalSalidas: totales[0]?.Salidas || 0,
                        error: null
                    });
                });
            });
        });
    });
}

