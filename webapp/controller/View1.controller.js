sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/json/JSONModel',
    './BaseController',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, BaseController) {
        "use strict";

        return BaseController.extend("tax.provisioning.computations.controller.View1", {
            onInit: function () {
                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;
            },

            onNewPress: function(oEvent){
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Creation");
            },

            onGo: function(oEvent){
                var that = this;

                var aFilter = [];

                var societa = this.getView().byId("smartFilterBar").getFilterData().societa;
                var ledger = this.getView().byId("smartFilterBar").getFilterData().ledger;
                var periodo = this.getView().byId("smartFilterBar").getFilterData().periodo;

                if(societa){
                    aFilter.push( new Filter("societa", "EQ", societa ) )
                }
                if(ledger){
                    aFilter.push( new Filter("ledger", "EQ", ledger ) )
                }
                if(periodo){
                    aFilter.push( new Filter("periodo", "EQ", periodo ) )
                }
                var oModel = this.getOwnerComponent().getModel("computationsModelV2");
                oModel.read("/ComputationsView", {
                    filters: aFilter,
                    success: function(oData, response) {
                        var arr = oData.results;
                        var data = {
                                    oModel: oData.results
                                };
                                var DataModel = new sap.ui.model.json.JSONModel();
                                DataModel.setData(data);
                                that.getView().setModel(DataModel, "tableModel");
                                },
                                
                    error: function(response) {
                                    sap.m.MessageToast.show("Error");
                            }
                        });

                // jQuery.ajax({
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/computation/ComputationsView"),
                //     contentType: "application/json",
                //     filters: aFilter,
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //     var data = {
                //         oModel: oCompleteEntry.value
                //     };
                //     var DataModel = new sap.ui.model.json.JSONModel();
                //     DataModel.setData(data);
                //     that.getView().setModel(DataModel, "tableModel");

                //     // var sDate = oCompleteEntry.createdAt;
                //     // var oDate = new Date(sDate.)

                //     // that.getView().byId("dateField").setValue(oDate);
                //     },
                //     error: function (error) {
                //     sap.m.MessageToast.show("Error");
                //     }
                // });
            },

            navigateToCurrentTax: function(oEvent){
                // oEvent.getSource().getBindingContext().getObject();
                // if(oEvent.getSource().getBindingContext("tableModel").getObject().configurazioneID){
                //     var conf = true; 
                // }else{
                //     var conf = false
                // }
                var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("CurrentTax", {
                        ID : oEvent.getSource().getBindingContext("tableModel").getObject().ID //ID computazione
                        //conf : conf
                        //descrizione : oEvent.getSource().getBindingContext("tableModel").getObject().descrizione,
                        //versioneID : oEvent.getSource().getBindingContext("tableModel").getObject().versioneID
                        //configurazioneID : oEvent.getSource().getBindingContext("tableModel").getObject().configurazioneID
                    }, false);
                
            }
           
        });
    });
