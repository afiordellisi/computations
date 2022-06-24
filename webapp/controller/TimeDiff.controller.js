sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    './BaseController',
    'sap/ui/model/odata/v2/ODataModel'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, BaseController, ODataModel) {
        "use strict";

        return BaseController.extend("tax.provisioning.computations.controller.TimeDiff", {

            onInit: function () {

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;
                this.getOwnerComponent().getRouter().getRoute("TimeDiff").attachPatternMatched(this._onObjectMatched, this);

            //     var oModel, oView, sServiceUrl;

            //     sServiceUrl = jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/v2/catalog/");
            //     oModel = new ODataModel(sServiceUrl, {
            //        defaultCountMode: "None"
            //    });

            //    oView = this.getView();
            //    oView.setModel(oModel);
            },

            // setTable: function(oEvent){
            //     console.log(oEvent)
            //     var computationID=this.getView().getModel("oModelTestata").getData().computationID;
            //     var imposta=this.getView().getModel("oModelTestata").getData().imposta;
            //     var that = this;

            //     var oSmartTable = oEvent.getSource();

            //     //var oSmartFilterBar = this.byId(oSmartTable.getSmartFilterId());

            //     //var path = oSmartFilterBar.getParameterBindingPath();
            //     var path= "/TimingDifferencesView(imposta='"+imposta+"',computationId="+computationID+")/Set"

            //     oSmartTable.setTableBindingPath(path);

            //     // jQuery.ajax({
            //     //     // url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/DTView(imposta='"+imposta+"',computationId="+computationID+")/Set"),
            //     //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni"),
            //     //     contentType: "application/json",
            //     //     type: 'GET',
            //     //     dataType: "json",
            //     //     async: false,
            //     //     success: function (oCompleteEntry) {
            //     //         var data = oCompleteEntry.value;
            //     //          var DataModel = new sap.ui.model.json.JSONModel();
            //     //          DataModel.setData(data);
            //     //          that.getView().setModel(DataModel, "");                         
            //     //         //that.getView().getModel().setData(data);
            //     //        // that.getView().getModel().oData = data
            //     //     },
            //     //     error: function (error) {
            //     //         sap.m.MessageToast.show("Error");
            //     //     }
            //     // });

            //     jQuery.ajax({
            //         url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/DTView(imposta='"+imposta+"',computationId="+computationID+")/Set"),
            //         // url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni"),
            //         // contentType: "application/json",
            //         type: 'GET',
            //         dataType: "json",
            //         async: false,
            //         success: function (oCompleteEntry) {
            //             var data = oCompleteEntry.value;
            //             var DataModel = new sap.ui.model.json.JSONModel();
            //             DataModel.setData(data);
            //             that.getView().setModel(DataModel, "");                         
            //             //that.getView().getModel().setData(data);
            //            // that.getView().getModel().oData = data
            //         },
            //         error: function (error) {
            //             sap.m.MessageToast.show("Error");
            //         }
            //     });

            // },

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

                        var DataModel2 = new sap.ui.model.json.JSONModel();
                        var totali = {totaleOB : 0, totalePRA : 0, totaleExt : 0, totaleCYA : 0, totaleCYU : 0, totaleOtA : 0, totaleCB : 0, totaleC1 : 0, totaleC2 : 0, totaleC3 : 0, totaleLT : 0};

                        for(var i =0; i<oCompleteEntry.value.length; i++){
                            totali.totaleOB += oCompleteEntry.value[i].OpeningBalance;
                            totali.totalePRA += oCompleteEntry.value[i].PriorYearAdjustments;
                            totali.totaleExt += oCompleteEntry.value[i].extraordinaryTransactions;
                            totali.totaleCYA += oCompleteEntry.value[i].CurrentYearAccrual;
                            totali.totaleCYU += oCompleteEntry.value[i].CurrentYearUtilization;
                            totali.totaleOtA += oCompleteEntry.value[i].otherAdjustments;
                            totali.totaleCB += oCompleteEntry.value[i].closingBalance;
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
            }
        });
    });