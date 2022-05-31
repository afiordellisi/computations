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

        return BaseController.extend("tax.provisioning.computations.controller.Allegati", {
            onInit: function () {
                this._bDescendingSort = false;
                ///this.oProductsTable = this.oView.byId("productsTable");
                this.oModel = this.getOwnerComponent().getModel();
                this.getOwnerComponent().getRouter().getRoute("Allegati").attachPatternMatched(this._onObjectMatched, this);
                
                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;
                //this.getView().getModel("oModelAnagrafica");

                this.oView = this.getView();
            
                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                //this.getView().getModel("oModelAnagraficaSingola");
            },

            _onObjectMatched: function (oEvent) {
                var oEvent = oEvent.getParameter("arguments");
                debugger;
                
                var codiceGL = oEvent.codiceGL; //ID computazione
                var ripresaID = oEvent.ripresaID; //ID ripresa singola

                var that = this;

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
            }
        });
    });
