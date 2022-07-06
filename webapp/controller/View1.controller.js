sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "./BaseController",
    "sap/ui/core/Fragment",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    Filter,
    FilterOperator,
    JSONModel,
    BaseController,
    Fragment
  ) {
    "use strict";

    var oGlobalBusyDialog = new sap.m.BusyDialog();

    return BaseController.extend(
      "tax.provisioning.computations.controller.View1",
      {
        onInit: function () {
          sap.ui.getCore().sapAppID = this.getOwnerComponent()
            .getMetadata()
            .getManifest()["sap.app"].id;
        },

        onNewPress: function (oEvent) {
          this.getRouter().navTo("Creation");
        },

        onGo: function (oEvent) {
          this.onOpenDialog();
          var that = this;
          var aFilter = [];

          var societa = this.getView().byId("smartFilterBar").getFilterData()
            .societa;
          var ledger = this.getView().byId("smartFilterBar").getFilterData()
            .ledger;
          var periodo = this.getView().byId("smartFilterBar").getFilterData()
            .periodo;

          if (societa) {
            aFilter.push(new Filter("societa", "EQ", societa));
          }
          if (ledger) {
            aFilter.push(new Filter("ledger", "EQ", ledger));
          }
          if (periodo) {
            aFilter.push(new Filter("periodo", "EQ", periodo));
          }
          var oModel = this.getOwnerComponent().getModel("computationsModelV2");
          oModel.read("/ComputationsView", {
            filters: aFilter,
            success: function (response) {
              var oData = response.results;
              var oDataModel = new JSONModel(oData);
              // DataModel.setData(data);
              //  that.getView().setModel(DataModel, "tableModel");
              that.setModel(oDataModel, "tableModel");
              that.onCloseDialog();
            },

            error: function (response) {
              sap.m.MessageToast.show("Error");
              that.onCloseDialog();
            },
          });
        },

        navigateToCurrentTax: function (oEvent) {
          this.getRouter().navTo(
            "CurrentTax",
            {
              ID: oEvent.getSource().getBindingContext("tableModel").getObject()
                .ID, //ID computazione
            },
            false
          );
        },
      }
    );
  }
);
