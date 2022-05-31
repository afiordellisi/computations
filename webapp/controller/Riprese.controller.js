sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/json/JSONModel',
    "sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/RowSettings",
	"sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, RowAction, RowActionItem, RowSettings, History) {
        "use strict";

        return Controller.extend("tax.provisioning.computations.controller.Riprese", {
            onInit: function () {
                this._bDescendingSort = false;
                this.oProductsTable = this.oView.byId("productsTable");
                this.oModel = this.getOwnerComponent().getModel();
                this.getOwnerComponent().getRouter().getRoute("RouteRiprese").attachPatternMatched(this._onObjectMatched, this);
                
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

                var that = this;

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/ComputationsView("+ID+")"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var data = {
                            oModelconfigurazione: oCompleteEntry.configurazioneID
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelConfigurazione");
                        that._setRipresa(oCompleteEntry.configurazioneID, ripresaID, ID);
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });

                //var configurazioneID = this.getView().getModel("oModelConfigurazione").getData().oModelconfigurazione; //ID configurazione
                

                                
            },

            _setRipresa: function(configurazioneID, ripresaID, ID){
                var that = this;

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni/"+configurazioneID+"?$expand=versione($expand=items($expand=algoritmi($filter=codiceRipresa_ID eq '"+ripresaID+"' and configurazione_ID eq "+configurazioneID+";$expand=ripreseManuali($filter=computations_ID eq "+ID+"))))"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var data = {
                            oModel1: oCompleteEntry
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelAnagraficaSingola");
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
