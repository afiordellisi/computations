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
        var configurazioneID;

        return BaseController.extend("tax.provisioning.computations.controller.Riprese", {
            onInit: function () {
                // this._bDescendingSort = false;
                // this.oProductsTable = this.oView.byId("productsTable");
                
                this.oModel = this.getOwnerComponent().getModel();
                this.getOwnerComponent().getRouter().getRoute("Riprese").attachPatternMatched(this._onObjectMatched, this);
                
                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;
                //this.getView().getModel("oModelAnagrafica");

                this.oView = this.getView();
            
                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                this.getView().getModel("oModelAnagraficaSingola");
            },

            _onObjectMatched: function (oEvent) {
                var oEvent = oEvent.getParameter("arguments");
                
                var ID = oEvent.ID; //ID computazione
                var ripresaID = oEvent.ripresaID; //ID ripresa singola
                configurazioneID = oEvent.configurazioneID;

                this._setRipresa(configurazioneID, ripresaID, ID);

                this.getView().setModel(new JSONModel({oModel: [{
                    "ID": ID
                  }]}), "IDcomputationModel");

                // var that = this;

                // jQuery.ajax({
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/ComputationsView("+ID+")"),
                //     contentType: "application/json",
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //         var data = {
                //             oModelconfigurazione: oCompleteEntry.configurazioneID
                //         };
                //         var DataModel = new sap.ui.model.json.JSONModel();
                //         DataModel.setData(data);
                //         that.getView().setModel(DataModel, "oModelConfigurazione");
                //         that._setRipresa(oCompleteEntry.configurazioneID, ripresaID, ID);
                //     },
                //     error: function (error) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });

                //var configurazioneID = this.getView().getModel("oModelConfigurazione").getData().oModelconfigurazione; //ID configurazione
                

                                
            },

            handleItemPress: function(oEvent){
                
                oEvent.getSource().getBindingContext("oModelAnagraficaSingola").getObject();

                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Allegati", {
                    ID : this.getView().getModel("IDcomputationModel").getData().oModel[0].ID,
                    ripresaID : this.getView().getModel("oModelAnagraficaSingolaTestata").getData().oModel2.ID,
                    codiceGL : oEvent.getSource().getBindingContext("oModelAnagraficaSingola").getObject().codiceGL,
                    descrizioneGL : oEvent.getSource().getBindingContext("oModelAnagraficaSingola").getObject().descrizioneGL,
                    versioneID : oEvent.getSource().getBindingContext("oModelAnagraficaSingola").getObject().versione_ID,
                    configurazioneID : configurazioneID
                }, true);
            },

            _setRipresa: function(configurazioneID, ripresaID, ID){
                var that = this;

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni/"+configurazioneID+"?$expand=versione($expand=trialBalances($expand=confRipresaAuto($filter=confRipresa_codiceRipresa_ID eq '"+ripresaID+"' and confRipresa_configurazione_ID eq "+configurazioneID+")))"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var percentuali = [];
                        for(var i=0; i < oCompleteEntry.versione.trialBalances.length; i++){
                            if(oCompleteEntry.versione.trialBalances[i].confRipresaAuto[0] !== undefined){
                                percentuali.push(oCompleteEntry.versione.trialBalances[i].confRipresaAuto[0].percentuale)
                            }else{
                                percentuali.push("not configured")
                            }
                        }
                        var data = {
                            oModel1: oCompleteEntry.versione.trialBalances
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelAnagraficaSingola");
                        //that.getView().getModel("oModelAnagraficaSingola").getData().oModel1.push(percentuali)
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                }); 

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AnagraficaRiprese/"+ripresaID+"?$expand=configurazioni($filter=configurazione_ID eq "+configurazioneID+")"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var data = {
                            oModel2: oCompleteEntry
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelAnagraficaSingolaTestata");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                }); 
            }
        });
    });
