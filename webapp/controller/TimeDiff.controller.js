sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    './BaseController'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, BaseController) {
        "use strict";

        return BaseController.extend("tax.provisioning.computations.controller.TimeDiff", {

            onInit: function () {

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;
                this.getOwnerComponent().getRouter().getRoute("TimeDiff").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                var oEvent = oEvent.getParameter("arguments");
                var computationID = oEvent.ID;
                var imposta = oEvent.imposta;

                var dataTestata = {"computationID" : computationID, "imposta" : imposta};
                var DataModelTestata = new sap.ui.model.json.JSONModel();
                DataModelTestata.setData(dataTestata);
                this.getView().setModel(DataModelTestata, "oModelTestata");

                var that = this;

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TimingDifferencesView(imposta='" + imposta + "',computationId=" + computationID + ")/Set"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var data = {
                            oModel: oCompleteEntry.value
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelTiming");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
            }
        });
    });