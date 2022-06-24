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
        var configurazioneID;
        var descrizioneComputazione;
        //var ripresaID;
        var versioneID;
        var computazioneID;
        //var imposta;

        return BaseController.extend("tax.provisioning.computations.controller.Riprese", {
            onInit: function () {
                // this._bDescendingSort = false;
                // this.oProductsTable = this.oView.byId("productsTable");

                this.oModel = this.getOwnerComponent().getModel();
                this.getOwnerComponent().getRouter().getRoute("Riprese").attachPatternMatched(this._onObjectMatched, this);

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;
                //this.getView().getModel("oModelAnagrafica");

                this.oView = this.getView();

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                this.getView().getModel("oModelAnagraficaSingola");
            },

            _onObjectMatched: function (oEvent) {
                var oEvent = oEvent.getParameter("arguments");
                
                computazioneID = oEvent.ID; //ID computazione
                var ripresaID = oEvent.ripresaID; //ID ripresa singola
                var imposta = oEvent.imposta;
                //var conf = oEvent.conf;
                //if(conf != "false"){
                    this._setRipresa(ripresaID, computazioneID, imposta);
               /* }else{
                    this._setRipresaNoConf(computazioneID, imposta, ripresaID);
                }*/
                

                this.getView().setModel(new JSONModel({
                    "ID": computazioneID,
                    "ripresaID": ripresaID,
                    "imposta" : imposta
                  }), "IDcomputationModel");

                // var that = this;

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

                //var configurazioneID = this.getView().getModel("oModelConfigurazione").getData().oModelconfigurazione; //ID configurazione



            },

            handleItemPress: function(oEvent){

                oEvent.getSource().getBindingContext("oModelAnagraficaSingola").getObject();

                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Allegati", {
                    ID : this.getView().getModel("IDcomputationModel").getData().ID, //computazione ID
                    ripresaID : this.getView().getModel("IDcomputationModel").getData().ripresaID,
                    codiceGL : oEvent.getSource().getBindingContext("oModelAnagraficaSingola").getObject().bilancio_codiceGL,
                    imposta: this.getView().getModel("IDcomputationModel").getData().imposta
                }, false);
            },

            _setRipresa: function(ripresaID, computazioneID, imposta){
                var that = this;
                
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/ConfRipresaAutoView?$count=true&$expand=confRipresa($expand=codiceRipresa)&$filter=ID eq "+computazioneID+" and confRipresa_codiceRipresa_ID eq '"+ripresaID+"' and confRipresa_imposta eq '"+imposta+"'"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        //var percentuali = [];
                        // for(var i=0; i < oCompleteEntry.versione.trialBalances.length; i++){
                        //     if(oCompleteEntry.versione.trialBalances[i].confRipresaAuto[0] !== undefined){
                        //         percentuali.push(oCompleteEntry.versione.trialBalances[i].confRipresaAuto[0].percentuale)
                        //     }else{
                        //         percentuali.push("not configured")
                        //     }
                        // }
                        var arr = oCompleteEntry.value;
                        var aItems = arr.map((arr) => {
                            return {
                            codiceRipresa: arr.confRipresa.codiceRipresa.ID,
                            descrizioneRipresa: arr.confRipresa.codiceRipresa.descrizioneRipresa,
                            riferimentoNormativo: arr.confRipresa.codiceRipresa.riferimentoNormativo,
                            riferimentoDichiarazione: arr.confRipresa.codiceRipresa.riferimentoDichiarazione
                            };
                        });
                        var data = {
                            oModel1: oCompleteEntry.value,
                            oModelRipresa: aItems[0],
                            oModelTestata: oCompleteEntry.value[0].confRipresa
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelAnagraficaSingola");
                        that._setTotali(computazioneID, imposta, ripresaID);
                        //that.getView().getModel("oModelAnagraficaSingola").oData.imposta = imposta
                        //that.getView().getModel("oModelAnagraficaSingola").getData().oModel1.push(percentuali)
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });

                // jQuery.ajax({
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni/"+configurazioneID+"?$expand=versione($expand=trialBalances($expand=confRipresaAuto($filter=confRipresa_codiceRipresa_ID eq '"+ripresaID+"' and confRipresa_configurazione_ID eq "+configurazioneID+")))"),
                //     contentType: "application/json",
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //         var percentuali = [];
                //         for(var i=0; i < oCompleteEntry.versione.trialBalances.length; i++){
                //             if(oCompleteEntry.versione.trialBalances[i].confRipresaAuto[0] !== undefined){
                //                 percentuali.push(oCompleteEntry.versione.trialBalances[i].confRipresaAuto[0].percentuale)
                //             }else{
                //                 percentuali.push("not configured")
                //             }
                //         }
                //         var data = {
                //             oModel1: oCompleteEntry.versione.trialBalances,
                //             oModelVersione: oCompleteEntry.versione.ID
                //         };
                //         var DataModel = new sap.ui.model.json.JSONModel();
                //         DataModel.setData(data);
                //         that.getView().setModel(DataModel, "oModelAnagraficaSingola");
                //         //that.getView().getModel("oModelAnagraficaSingola").oData.imposta = imposta
                //         //that.getView().getModel("oModelAnagraficaSingola").getData().oModel1.push(percentuali)
                //     },
                //     error: function (error) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });

                // jQuery.ajax({
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AnagraficaRiprese/"+ripresaID+"?$expand=configurazioni($filter=configurazione_ID eq "+configurazioneID+")"),
                //     contentType: "application/json",
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //         var data = {
                //             oModel2: oCompleteEntry
                //         };
                //         var DataModel = new sap.ui.model.json.JSONModel();
                //         DataModel.setData(data);
                //         that.getView().setModel(DataModel, "oModelAnagraficaSingolaTestata");
                //     },
                //     error: function (error) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });
            },

            _setRipresaNoConf: function(computazioneID, imposta, ripresaID ){
                var that = this;
                
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/ComputazioneNoConfListaBilancioView?$expand=codiceRipresa&$filter=ID eq "+computazioneID+" and imposta eq '"+imposta+"' and codiceRipresa_ID eq '"+ripresaID+"'"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var arr = oCompleteEntry.value;
                        
                        var aItems = arr.map((arr) => {
                            return {
                            bilancio_codiceGL: arr.codiceGL,
                            descrizioneGL: arr.descrizioneGL,
                            classificazione: arr.classificazione,
                            importoCY: arr.importoCY,
                            importoLY: arr.importoLY,
                            percentuale: 0,
                            ripresaAuto: 0,
                            ripresaManuale: arr.ripresaManuale,
                            totaleRipresa: arr.totaleRipresa
                            };
                        });
                        var sum = 0;
                            for(var i =0; i< aItems.length; i++){
                               sum += aItems[i].totaleRipresa
                            }
                        var totCY = 0;
                        for(var i =0; i< aItems.length; i++){
                            totCY += aItems[i].importoCY
                         }
                        var aItems2 = arr.map((arr) => {
                            return {
                                codiceRipresa: arr.codiceRipresa.ID,
                                descrizioneRipresa: arr.codiceRipresa.descrizioneRipresa,
                                riferimentoNormativo: arr.codiceRipresa.riferimentoNormativo,
                                riferimentoDichiarazione: arr.codiceRipresa.riferimentoDichiarazione,
                                imposta: arr.imposta,
                                totaleRipresa: sum,
                                TotaleCY : totCY
                            };
                        });
                        var data = {
                            oModel1: aItems,
                            oModelRipresa: aItems2[0],
                            oModelTestata: aItems2[0]
                        };
                        var data2 = {
                            oModelTot: aItems2[0]
                        }
                        
                        var DataModel2 = new sap.ui.model.json.JSONModel();
                        DataModel2.setData(data2);
                        that.getView().setModel(DataModel2, "oModelTotali");
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelAnagraficaSingola");
                        //that._setTotali(computazioneID, imposta, ripresaID);
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
            },

            _setTotali: function(computazioneID, imposta, ripresaID){
                var that = this;
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/ConfRipresaAutoView?$apply=filter(ID eq "+computazioneID+" and confRipresa_codiceRipresa_ID eq '"+ripresaID+"' and confRipresa_imposta eq '"+imposta+"')/aggregate(importoCY with sum as TotaleCY,ripresaAuto with sum as TotaleAuto,ripresaManuale with sum as TotaleManuale,totaleRipresa with sum as TotaleRipresa)"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var arr = oCompleteEntry.value;
                        var aItems2 = arr.map((arr) => {
                            return {
                                totaleRipresa: arr.TotaleRipresa,
                                TotaleCY: arr.TotaleCY
                            };
                        });
                        var data = {
                            oModelTot: aItems2[0]
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelTotali");
                        //that.getView().getModel("oModelAnagraficaSingola").oData.imposta = imposta
                        //that.getView().getModel("oModelAnagraficaSingola").getData().oModel1.push(percentuali)
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
            }

        //     onNavBack: function(oEvent){
        //         this.getRouter().navTo("CurrentTax", {
        //             ID : this.getView().getModel("IDcomputationModel").getData().ID
        //             //ID : computazioneID
        //         });
        //     }
        });
    });
