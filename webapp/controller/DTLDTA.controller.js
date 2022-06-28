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


                        var modello = [{
                            "computationId": null,
                            "imposta": null,
                            "codiceRipresa": "Totali",
                            "descrizioneRipresa": "",
                            "OpeningBalance": 0,
                            "PriorYearAdjustments": 0,
                            "CurrentYearAccrual": 0,
                            "CurrentYearUtilization": 0,
                            "extraordinaryTransactions": 0,
                            "otherAdjustments": 0,
                            "closingGrossBalance": 0,
                            "changeTaxRate": 0,
                            "devaluationOpening": 0,
                            "devaluationMovement": 0,
                            "devaluationClosing": 0,
                            "closingNetBalance": 0,
                            "movementPL": 0,
                            "current1": 0,
                            "current2": 0,
                            "current3": 0,
                            "longTerm": 0
                            }];
                            
                        
                        
                        // var DataModel2 = new sap.ui.model.json.JSONModel();
                        // var totali = {totaleOB : 0, totalePRA : 0, totaleExt : 0, totaleCYA : 0, totaleCYU : 0, totaleOtA : 0, totaleChangeTax : 0, totaleDevOp : 0, totaleDevMov : 0, totaleDevC : 0, totaleCNB : 0, totaleMPL : 0, totaleMBS : 0, totaleCGB : 0, totaleC1 : 0, totaleC2 : 0, totaleC3 : 0, totaleLT : 0};
                        

                        for(var i =0; i<oCompleteEntry.value.length; i++){

                            if(oCompleteEntry.value[i].OpeningBalance){
                                //oCompleteEntry.value[i].OpeningBalance = 0;
                                modello[0].OpeningBalance += oCompleteEntry.value[i].OpeningBalance;
                            }
                            
                            if(oCompleteEntry.value[i].PriorYearAdjustments){
                                modello[0].PriorYearAdjustments += oCompleteEntry.value[i].PriorYearAdjustments;
                            }

                            if(oCompleteEntry.value[i].extraordinaryTransactions){
                                modello[0].extraordinaryTransactions += oCompleteEntry.value[i].extraordinaryTransactions;
                            }

                            if(oCompleteEntry.value[i].CurrentYearAccrual){
                                modello[0].CurrentYearAccrual += oCompleteEntry.value[i].CurrentYearAccrual;
                            }

                            if(oCompleteEntry.value[i].CurrentYearUtilization){
                                modello[0].CurrentYearUtilization += oCompleteEntry.value[i].CurrentYearUtilization;
                            }

                            if(oCompleteEntry.value[i].otherAdjustments){
                                modello[0].otherAdjustments += oCompleteEntry.value[i].otherAdjustments;
                            }
                            
                            if(oCompleteEntry.value[i].changeTaxRate){
                                modello[0].changeTaxRate += oCompleteEntry.value[i].changeTaxRate;
                            }

                            if(oCompleteEntry.value[i].devaluationOpening){
                                modello[0].devaluationOpening += oCompleteEntry.value[i].devaluationOpening;
                            }
                            
                            if(oCompleteEntry.value[i].devaluationMovement){
                                modello[0].devaluationMovement += oCompleteEntry.value[i].devaluationMovement;
                            }
                            
                            if(oCompleteEntry.value[i].devaluationClosing){
                                modello[0].devaluationClosing += oCompleteEntry.value[i].devaluationClosing;
                            }

                            if(oCompleteEntry.value[i].closingNetBalance){
                                modello[0].closingNetBalance += oCompleteEntry.value[i].closingNetBalance;
                            }
                            
                            if(oCompleteEntry.value[i].movementPL){
                                modello[0].movementPL += oCompleteEntry.value[i].movementPL;
                            }
                            
                            if(oCompleteEntry.value[i].closingGrossBalance){
                                modello[0].closingGrossBalance += oCompleteEntry.value[i].closingGrossBalance;
                            }
                            
                            if(oCompleteEntry.value[i].current1){
                                modello[0].current1 += oCompleteEntry.value[i].current1;
                            }
                            
                            if(oCompleteEntry.value[i].current2){
                                modello[0].current2 += oCompleteEntry.value[i].current2;
                            }

                            if(oCompleteEntry.value[i].current3){
                                modello[0].current3 += oCompleteEntry.value[i].current3;
                            }

                            if(oCompleteEntry.value[i].longTerm){
                                modello[0].longTerm += oCompleteEntry.value[i].longTerm;
                            }
                            
                        }

                        data.oModel.push(modello[0]);

                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelDT");
                        
                        // var data2 = totali;
                        // DataModel2.setData(data2);
                        // that.getView().setModel(DataModel2, "oModelTotali");
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