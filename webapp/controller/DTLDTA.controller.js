sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    './BaseController',
	'sap/ui/model/odata/v2/ODataModel',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, BaseController, ODataModel) {
        "use strict";

        return BaseController.extend("tax.provisioning.computations.controller.DTLDTA", {

            onInit: function () {

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;
                this.getOwnerComponent().getRouter().getRoute("DTLDTA").attachPatternMatched(this._onObjectMatched, this);

                var oModel, oView, sServiceUrl;
                //this.getView().byId("LineItemsSmartTable").setModel("computationsModel");
                sServiceUrl = jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/v2/catalog/");
                oModel = new ODataModel(sServiceUrl, {
                   defaultCountMode: "None"
               });

               oView = this.getView();
               oView.setModel(oModel); 

            },

            setTable: function(oEvent){
                console.log(oEvent)
                var computationID=this.getView().getModel("oModelTestata").getData().computationID;
                var imposta=this.getView().getModel("oModelTestata").getData().imposta;
                var that = this;

                var oSmartTable = oEvent.getSource();

                //var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());

                //var path = oSmartFilterBar.getParameterBindingPath();
                var path= "/DTView(imposta='"+imposta+"',computationId="+computationID+")/Set"

                oSmartTable.setTableBindingPath(path);

                // jQuery.ajax({
                //     // url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/DTView(imposta='"+imposta+"',computationId="+computationID+")/Set"),
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni"),
                //     contentType: "application/json",
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //         var data = oCompleteEntry.value;
                //          var DataModel = new sap.ui.model.json.JSONModel();
                //          DataModel.setData(data);
                //          that.getView().setModel(DataModel, "");                         
                //         //that.getView().getModel().setData(data);
                //        // that.getView().getModel().oData = data
                //     },
                //     error: function (error) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });

                // jQuery.ajax({
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/DTView(imposta='"+imposta+"',computationId="+computationID+")/Set"),
                //     // url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni"),
                //     // contentType: "application/json",
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //         var data = {oModel: oCompleteEntry.value};
                //         var DataModel = new sap.ui.model.json.JSONModel();
                //         // var totali = oCompleteEntry.value[0];
                //         // totali.codiceRipresa = "TOTALE";                        
                //         // data.push(totali);
                //         DataModel.setData(data);
                //         that.getView().setModel(DataModel, "oModelDT");                         
                //         //that.getView().getModel().setData(data);
                //        // that.getView().getModel().oData = data
                //     },
                //     error: function (error) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });

            },

            editFunction: function(oEvent){
                
            },


            _onObjectMatched: function (oEvent) {
                var oEvent = oEvent.getParameter("arguments");
                var computationID = oEvent.ID;
                var imposta = oEvent.imposta;

                var dataTestata = {"computationID" : computationID, "imposta" : imposta};
                var DataModelTestata = new sap.ui.model.json.JSONModel();
                DataModelTestata.setData(dataTestata);
                this.getView().setModel(DataModelTestata, "oModelTestata");

                //oView = this.getView().byId("LineItemsSmartTable");
                //this.getView().byId("LineItemsSmartTable").setModel(oModel);

                var that = this;

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/DTView(imposta='"+imposta+"',computationId="+computationID+")/Set"),
                    // url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni"),
                    // contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        
                        var DataModel = new sap.ui.model.json.JSONModel();
                        var data = {
                            oModel: oCompleteEntry.value
                        };
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelDT");                         
                        
                        var DataModel2 = new sap.ui.model.json.JSONModel();
                        var totali = {
                            totaleOB : 0, 
                            totalePRA : 0, 
                            totaleExt : 0, 
                            totaleCYA : 0, 
                            totaleCYU : 0, 
                            totaleOtA : 0, 
                            totaleChangeTax : 0, 
                            totaleDevOp : 0, 
                            totaleDevMov : 0, 
                            totaleDevC : 0, 
                            totaleCNB : 0, 
                            totaleMPL : 0, 
                            totaleMBS : 0, 
                            totaleCGB : 0, 
                            totaleC1 : 0,
                            totaleC2 : 0,
                            totaleC3 : 0, 
                            totaleLT : 0
                        };

                        for(var i =0; i<oCompleteEntry.value.length; i++){
                            totali.totaleOB += oCompleteEntry.value[i].OpeningBalance;
                            totali.totalePRA += oCompleteEntry.value[i].PriorYearAdjustments;
                            totali.totaleExt += oCompleteEntry.value[i].extraordinaryTransactions;
                            totali.totaleCYA += oCompleteEntry.value[i].CurrentYearAccrual;
                            totali.totaleCYU += oCompleteEntry.value[i].CurrentYearUtilization;
                            totali.totaleOtA += oCompleteEntry.value[i].otherAdjustments;
                            totali.totaleChangeTax += oCompleteEntry.value[i].changeTaxRate;
                            totali.totaleDevOp += oCompleteEntry.value[i].devaluationOpening;
                            totali.totaleDevMov += oCompleteEntry.value[i].devaluationMovement;
                            totali.totaleDevC += oCompleteEntry.value[i].devaluationClosing;
                            totali.totaleCNB += oCompleteEntry.value[i].closingNetBalance;
                            totali.totaleMPL += oCompleteEntry.value[i].movementPL;
                            //totali.totaleMBS += oCompleteEntry.value[i].movementBS;
                            totali.totaleCGB += oCompleteEntry.value[i].closingGrossBalance;
                            totali.totaleC1 += oCompleteEntry.value[i].current1;
                            totali.totaleC2 += oCompleteEntry.value[i].current2;
                            totali.totaleC3 += oCompleteEntry.value[i].current3;
                            totali.totaleLT += oCompleteEntry.value[i].longTerm;
                        }

                        var data2 = totali;
                        DataModel2.setData(data2);
                        that.getView().setModel(DataModel2, "oModelTotali");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });


                // jQuery.ajax({
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/DTView(imposta='IRES',computationId="+computationID+")/Set"),
                //     contentType: "application/json",
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //         var data = oCompleteEntry.value;
                //         var DataModel = new sap.ui.model.json.JSONModel();
                //         DataModel.setData(data);
                //         that.getView().byId("LineItemsSmartTable").setModel(DataModel);
                //     },
                //     error: function (error) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });

                // jQuery.ajax({
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TimingDifferencesView(imposta='" + imposta + "',computationId=" + computationID + ")/Set"),
                //     contentType: "application/json",
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //         var data = {
                //             oModel: oCompleteEntry.value
                //         };
                //         var DataModel = new sap.ui.model.json.JSONModel();
                //         DataModel.setData(data);
                //         that.getView().setModel(DataModel, "oModelTiming");
                //     },
                //     error: function (error) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });
            }
        });
    });