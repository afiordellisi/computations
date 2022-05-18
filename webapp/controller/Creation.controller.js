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

        return Controller.extend("tax.provisioning.computations.Creation.controller.View1", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.getView().setModel();
            }
           
        });
    });
