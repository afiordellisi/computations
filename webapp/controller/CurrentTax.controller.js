sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/json/JSONModel'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel) {
        "use strict";

        return Controller.extend("tax.provisioning.computations.controller.CurrentTax", {
            onInit: function () {
                this.oView = this.getView();
                //this._bDescendingSort = false;
                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                var that = this;

                var oModel = this.getOwnerComponent().getModel("catalogModel");

                oModel.read("/Imposte", {
                    success: function (oData, response) {
                        var data = {
                            oModel: oData.results
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "imposteModel");
                    },

                    error: function (response) {
                        sap.m.MessageToast.show("Error");
                    }
                });

                this.oProductsTable = this.oView.byId("productsTable");             

                //this.getView().byId("productsTable").setModel("catalogModel");

                //lettura modello AnagraficaRiprese
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AnagraficaRiprese?$expand=configurazioni&$filter=tipologia eq 'P'"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var data = {
                            oModel1: oCompleteEntry.d.results
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelAnagrafica");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });      
                
                this._mFilters = {
                    "Permanenti": [new Filter("tipologia", FilterOperator.EQ, "P")],
                    "Temporanee": [new Filter("tipologia", FilterOperator.EQ, "T")]
                };

                this._setHeader();
            },

            onQuickFilter: function (oEvent) {
                var that = this;
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AnagraficaRiprese"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var data = {
                            oModel1: oCompleteEntry.d.results
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelAnagrafica");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
                var oBinding = this.oProductsTable.getBinding("items"),
                    sKey = oEvent.getParameter("selectedKey");
                oBinding.filter(this._mFilters[sKey]);
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
