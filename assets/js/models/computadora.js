let SQLHelper = require('../server_side/sql-helper.js');
let TYPES = require('tedious').TYPES;
const os = require('os');

var Computadora = {
    getDesktops: function () {
        SQLHelper.createConnection();
        var query = 'SELECT * FROM [Catalogo].[Computadora]'
        SQLHelper.clearSqlParameters();
        return SQLHelper.executeStatement(query, false);  
    },

    getDesktopsInUse: function () {
        SQLHelper.createConnection();
        var query = `SELECT idComputadora
                            ,fechaInicio
                            ,fechaFin
                            ,totalPagar 
                        FROM [Entidad].[RegistroComputadora]
                    WHERE CAST(fechaInicio AS DATE) = CAST(GETDATE() AS DATE)
                        AND fechaFin IS NULL`;
        SQLHelper.clearSqlParameters();
        return SQLHelper.executeStatement(query, false);  
    },

    updateDesktopOnline: function (idComputadora, enLinea) {
        SQLHelper.createConnection();
        var query = "servidor.ActualizarEstadoComputadora"
        SQLHelper.clearSqlParameters();
        SQLHelper.addSqlParameter(SQLHelper.sqlParameter('idComputadora', idComputadora, TYPES.Int));
        SQLHelper.addSqlParameter(SQLHelper.sqlParameter('enLinea', enLinea, TYPES.Bit));
        return SQLHelper.executeStatement(query, true);  
    },

    getDesktop: function (localAddress) {
        SQLHelper.createConnection();
        var query = 'cliente.ObtenerIdComputadora'
        SQLHelper.clearSqlParameters();
        SQLHelper.addSqlParameter(SQLHelper.sqlParameter('ipCliente', localAddress, TYPES.VarChar));
        SQLHelper.addSqlParameter(SQLHelper.sqlParameter('nombreCliente', os.hostname(), TYPES.VarChar));
        return SQLHelper.executeStatement(query, true);
    },

    getDesktopByName: function () {
        SQLHelper.createConnection();
        var query = 'SELECT * FROM Catalogo.Computadora WHERE nombre = @nombre'
        SQLHelper.clearSqlParameters();
        SQLHelper.addSqlParameter(SQLHelper.sqlParameter('nombre', os.hostname(), TYPES.VarChar));
        return SQLHelper.executeStatement(query, false);
    },

    getDesktopByIPAddress: function (IPAddress) {
        SQLHelper.createConnection();
        var query = 'SELECT * FROM Catalogo.Computadora WHERE [IP] = @ipAddress'
        SQLHelper.clearSqlParameters();
        SQLHelper.addSqlParameter(SQLHelper.sqlParameter('ipAddress', IPAddress, TYPES.VarChar));
        return SQLHelper.executeStatement(query, false);
    },

    updateDesktopRecord: function (idComputadora, fecha) {
        SQLHelper.createConnection();
        var query = "cliente.GuardarRegistroComputadora"
        SQLHelper.clearSqlParameters();
        SQLHelper.addSqlParameter(SQLHelper.sqlParameter('idComputadora', idComputadora, TYPES.Int));
        SQLHelper.addSqlParameter(SQLHelper.sqlParameter('fecha', fecha, TYPES.DateTime));
        return SQLHelper.executeStatement(query, true);  
    },
}

module.exports = Computadora