sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/json/JSONModel',
    "sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/RowSettings",
	"sap/ui/core/routing/History",
    './BaseController',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, RowAction, RowActionItem, RowSettings, History, BaseController) {
        "use strict";
        var bConfigurazione = false;

        return BaseController.extend("tax.provisioning.computations.controller.CurrentTax", {
            onInit: function () {

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                this.oModel = this.getOwnerComponent().getModel();
                
                this.getOwnerComponent().getRouter().getRoute("CurrentTax").attachPatternMatched(this._onObjectMatched, this);

                this._setHeader();
            },

            handleActionPress : function(oEvent) {
               
                var oRouter = this.getOwnerComponent().getRouter();
                debugger;
                    oRouter.navTo("Riprese", {
                        ripresaID : oEvent.getSource().getBindingContext("oModelAnagrafica").getObject().ID,
                        ID : this.getView().getModel("computationModel").getData().oModel[0].ID, //ID computazione
                        configurazioneID :  this.getView().getModel("computationModel").getData().oModel[0].configurazioneID,
                        imposta: this.getView().byId("impostaButton").getSelectedKey()
                    }, true);
            },

            onNavBack: function(oEvent){
                this.getRouter().navTo("View1");
            },

            onScegliImposta: function(oEvent){
                var that = this;
                //if(bConfigurazione){
                    var configurazioneID = this.getView().getModel("computationModel").getData().oModel[0].configurazioneID;
                    var imposta = that.getView().byId("impostaButton").getSelectedKey();
                    //var tipologia = that.getView().byId("iconTabBar").getSelectedKey().charAt(0);
                    //var tipologia = this.getView().getModel("oModelAnagrafica").getData();
                    debugger;
                    jQuery.ajax({
                        url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AnagraficaRiprese?$expand=configurazioni($filter=configurazione_ID eq " + configurazioneID + " and imposta eq '" + imposta + "')"),
                        contentType: "application/json",
                        type: 'GET',
                        dataType: "json",
                        async: false,
                        success: function (oCompleteEntry) {
                            var arr = oCompleteEntry.value;
                            var PA = arr.filter(ripresa => ripresa.tipologia === 'P' && ripresa.tipoVariazione === 'A');
                            var PD = arr.filter(ripresa => ripresa.tipologia === 'P' && ripresa.tipoVariazione === 'D');
                            var TA = arr.filter(ripresa => ripresa.tipologia === 'T' && ripresa.tipoVariazione === 'A');
                            var TD = arr.filter(ripresa => ripresa.tipologia === 'T' && ripresa.tipoVariazione === 'D');
                            var PER = arr.filter(ripresa => ripresa.tipoVariazione === 'PER');
                            var ACE = arr.filter(ripresa => ripresa.tipoVariazione === 'ACE');
                            var PAImponibile;
                            var data = {
                                oModelPA : PA,
                                oModelPD : PD,
                                oModelTA : TA,
                                oModelTD : TD,
                                oModelPER : PER,
                                oModelACE : ACE, 
                                oModelPAImponibile: PAImponibile
                            };
                            var DataModel = new sap.ui.model.json.JSONModel();
                            DataModel.setData(data);
                            that.getView().setModel(DataModel, "oModelAnagrafica");
                        },
                        error: function (error) {
                            sap.m.MessageToast.show("Error");
                        }
                    });
                //}
                // else{
                //     jQuery.ajax({
                //         url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AnagraficaRiprese"),
                //         contentType: "application/json",
                //         type: 'GET',
                //         dataType: "json",
                //         async: false,
                //         success: function (oCompleteEntry) {
                //             var data = {
                //                 oModel: oCompleteEntry.value
                //             };
                //             var DataModel = new sap.ui.model.json.JSONModel();
                //             DataModel.setData(data);
                //             that.getView().setModel(DataModel, "oModelAnagrafica");
                //         },
                //         error: function (error) {
                //             sap.m.MessageToast.show("Error");
                //         }
                //     });
                //     var oBinding = this.oProductsTable.getBinding("items"),
                //         sKey = oEvent.getParameter("selectedKey");
                //     oBinding.filter(this._mFilters[sKey]);
                //     sTab = sKey;
                // }  
            },

            _onObjectMatched: function (oEvent) {
                var oEvent = oEvent.getParameter("arguments");
                
                var ID = oEvent.ID; //ID computazione
                var descrizioneComputazione = oEvent.descrizione;
                var configurazioneID = oEvent.configurazioneID;
                

                this.getView().setModel(new JSONModel({oModel: [{
                    "ID": ID, 
                    "descrizioneComputazione" : descrizioneComputazione,
                    "configurazioneID" : configurazioneID
                  }]}), "computationModel");
                
                var that = this;
                //lettura modello AnagraficaRiprese
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AnagraficaRiprese"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var arr = oCompleteEntry.value;
                        var PA = arr.filter(ripresa => ripresa.tipologia === 'P' && ripresa.tipoVariazione === 'A');
                        var PD = arr.filter(ripresa => ripresa.tipologia === 'P' && ripresa.tipoVariazione === 'D');
                        var TA = arr.filter(ripresa => ripresa.tipologia === 'T' && ripresa.tipoVariazione === 'A');
                        var TD = arr.filter(ripresa => ripresa.tipologia === 'T' && ripresa.tipoVariazione === 'D');
                        var PER = arr.filter(ripresa => ripresa.tipoVariazione === 'PER');
                        var ACE = arr.filter(ripresa => ripresa.tipoVariazione === 'ACE');
                        var PAImponibile;
                        var data = {
                            oModelPA : PA,
                            oModelPD : PD,
                            oModelTA : TA,
                            oModelTD : TD,
                            oModelPER : PER,
                            oModelACE : ACE, 
                            oModelPAImponibile: PAImponibile
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelAnagrafica");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });

            },

            _setHeader: function(){
                this.getView().setModel(new JSONModel({oModel: [{
                    "imponibile": 250000,
                    // "imposta": "60.000",
                    "unico": "",
                    // "correnti": "60.000",
                    "differite": "",
                    //"totale": "60.000",
                    "impostaPerc": 24,
                    "testo": "Utile perdita ante imposte"
                  }]}), "headerModel");
            }
        });
    });
