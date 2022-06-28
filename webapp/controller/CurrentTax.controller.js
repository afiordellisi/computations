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
        var bConfigurazione = false;

        return BaseController.extend("tax.provisioning.computations.controller.CurrentTax", {
            onInit: function () {

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                this.oModel = this.getOwnerComponent().getModel();
                
                this.getOwnerComponent().getRouter().getRoute("CurrentTax").attachPatternMatched(this._onObjectMatched, this);

                this._setHeader();
               
            },

            handleActionPress : function(oEvent) {
                var oRouter = this.getOwnerComponent().getRouter();
                
                    oRouter.navTo("Riprese", {
                        ripresaID : oEvent.getSource().getBindingContext("oModelAnagrafica").getObject().codiceRipresa,
                        ID :  this.getView().getModel("computationModel").getData().ID,
                        imposta : this.getView().byId("impostaButton").getSelectedKey()
                        //conf : this.getView().getModel("computationModel").getData().conf
                    }, false);
                
            },

            onNavBack: function(oEvent){
                this.getRouter().navTo("View1");
            },

            onScegliImposta: function(oEvent){
                    var that = this;
                    var ID = this.getView().getModel("computationModel").getData().ID;
                    //var conf = this.getView().getModel("computationModel").getData().conf;
                    var imposta = that.getView().byId("impostaButton").getSelectedKey();
                    
                    //if(conf != "false"){
                        jQuery.ajax({
                            url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TotRipresaView?$count=true&$filter=computationId eq "+ID+" and imposta eq '"+imposta+"'"),
                            contentType: "application/json",
                            type: 'GET',
                            dataType: "json",
                            async: false,
                            success: function (oCompleteEntry) {
                                var arr = oCompleteEntry.value;
                                var PA = arr.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'A');
                                var PD = arr.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'D');
                                var TA = arr.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'A');
                                var TD = arr.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'D');
                                var PER = arr.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'PER');
                                var ACE = arr.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'ACE');
                                var PAImponibile = 0;
                                for (var i = 0; i < PA.length; i++) {
                                    PAImponibile += PA[i].imponibile;
                                }
                                var PDImponibile = 0;
                                for (var i = 0; i < PD.length; i++) {
                                    PDImponibile += PD[i].imponibile;
                                }
                                var TAImponibile = 0;
                                for (var i = 0; i < TA.length; i++) {
                                    TAImponibile += TA[i].imponibile;
                                }
                                var TDImponibile = 0;
                                for (var i = 0; i < TD.length; i++) {
                                    TDImponibile += TD[i].imponibile;
                                }
                                var PERImponibile = 0; 
                                PERImponibile = PAImponibile + PDImponibile + TAImponibile + TDImponibile + that.getView().getModel("headerModel").oData.oModel[0].imponibile;
                                // for (var i = 0; i < PER.length; i++) {
                                //     PERImponibile += PER[i].imponibile;
                                // }
                                var ACEImponibile = 0;
                                // for (var i = 0; i < ACE.length; i++) {
                                //     ACEImponibile += ACE[i].imponibile;
                                // }
                                for (var i = 0; i <  PER.length; i++) {
                                    ACEImponibile += PER[i].imponibile;
                                }
                                ACEImponibile += PERImponibile ;

                                var RedditoImponibile = 0;
                                for (var i = 0; i < ACE.length; i++) {
                                    RedditoImponibile += ACE[i].imponibile;
                                }
                                RedditoImponibile += ACEImponibile; //questo valore va salvato, quindi serve su backend
                                var data = {
                                    oModelPA : PA,
                                    oModelPD : PD,
                                    oModelTA : TA,
                                    oModelTD : TD,
                                    oModelPER : PER,
                                    oModelACE : ACE, 
                                    oModelPAImponibile: PAImponibile,
                                    oModelPDImponibile: PDImponibile,
                                    oModelTAImponibile: TAImponibile,
                                    oModelTDImponibile: TDImponibile,
                                    oModelPERImponibile: PERImponibile, 
                                    oModelACEImponibile: ACEImponibile, 
                                    oModelRedditoImponibile: RedditoImponibile
                                };
                                var DataModel = new sap.ui.model.json.JSONModel();
                                DataModel.setData(data);
                                that.getView().setModel(DataModel, "oModelAnagrafica");
                            },
                            error: function (error) {
                                sap.m.MessageToast.show("Error");
                            }
                        });
                    /*}else{
                        //var computazioneID = JSON.stringify({"id": ID});
                        jQuery.ajax({
                            url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TotaliRipresaNoConf?$expand=codiceRipresa&$filter=imposta eq '"+imposta+"' and ID eq "+ID+""),
                            contentType: "application/json",
                            type: 'GET',
                            dataType: "json",
                            async: false,
                            success: function (oCompleteEntry) {
                            var arr = oCompleteEntry.value;
                            
                            var aItems = arr.map((arr) => {
                                return {
                                codiceRipresa: arr.codiceRipresa.ID,
                                descrizioneRipresa: arr.codiceRipresa.descrizioneRipresa,
                                imponibile: 0,
                                tipoVariazione: arr.codiceRipresa.tipoVariazione,
                                tipologia: arr.codiceRipresa.tipologia, 
                                imponibile: arr.totaleRipresa
                                };
                            });
                            var PA = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'A');
                            var PD = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'D');
                            var TA = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'A');
                            var TD = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'D');
                            var PER = aItems.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'PER');
                            var ACE = aItems.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'ACE');
                            var PAImponibile = 0;
                            for (var i = 0; i < PA.length; i++) {
                                PAImponibile += PA[i].imponibile;
                            }
                            var PDImponibile = 0;
                            for (var i = 0; i < PD.length; i++) {
                                PDImponibile += PD[i].imponibile;
                            }
                            var TAImponibile = 0;
                            for (var i = 0; i < TA.length; i++) {
                                TAImponibile += TA[i].imponibile;
                            }
                            var TDImponibile = 0;
                            for (var i = 0; i < TD.length; i++) {
                                TDImponibile += TD[i].imponibile;
                            }
                            var PERImponibile = 0;
                            for (var i = 0; i < PER.length; i++) {
                                PERImponibile += PER[i].imponibile;
                            }
                            var ACEImponibile = 0;
                            for (var i = 0; i < ACE.length; i++) {
                                ACEImponibile += ACE[i].imponibile;
                            }
                                var data = {
                                    oModelPA : PA,
                                    oModelPA : PA,
                                    oModelPD : PD,
                                    oModelTA : TA,
                                    oModelTD : TD,
                                    oModelPER : PER,
                                    oModelACE : ACE, 
                                    oModelPAImponibile: PAImponibile,
                                    oModelPDImponibile: PDImponibile,
                                    oModelTAImponibile: TAImponibile,
                                    oModelTDImponibile: TDImponibile,
                                    oModelPERImponibile: PERImponibile,
                                    oModelACEImponibile: ACEImponibile
                                }
                                var DataModel = new sap.ui.model.json.JSONModel();
                                DataModel.setData(data);
                                that.getView().setModel(DataModel, "oModelAnagrafica");
                            },
                            error: function (error) {
                                sap.m.MessageToast.show("Error");
                            }
                        });
                    }*/

                this._setTitle();
                        //     var arr = oCompleteEntry.value;
                        // var PA = [];
                        // var PD = [];
                        // var TA = [];
                        // var TD = [];
                        // var PER = [];
                        // var ACE = [];
                        // for(var i=0; i<arr.length; i++){
                        //     if(arr[i].codiceRipresa.tipologia === 'P' && arr[i].codiceRipresa.tipoVariazione === 'A'){
                        //         PA.push(arr[i]);
                        //     }
                        //     if(arr[i].codiceRipresa.tipologia === 'P' && arr[i].codiceRipresa.tipoVariazione === 'D'){
                        //         PD.push(arr[i]);
                        //     }
                        //     if(arr[i].codiceRipresa.tipologia === 'T' && arr[i].codiceRipresa.tipoVariazione === 'A'){
                        //         TA.push(arr[i]);
                        //     }
                        //     if(arr[i].codiceRipresa.tipologia === 'T' && arr[i].codiceRipresa.tipoVariazione === 'D'){
                        //         TD.push(arr[i]);
                        //     }
                        //     if(arr[i].codiceRipresa.tipoVariazione === 'PER'){
                        //         PER.push(arr[i]);
                        //     }
                        //     if(arr[i].codiceRipresa.tipoVariazione === 'ACE'){
                        //         ACE.push(arr[i]);
                        //     }
                        // }
                        // var PAImponibile;
                        // var data = {
                        //     oModelPA : PA,
                        //     oModelPD : PD,
                        //     oModelTA : TA,
                        //     oModelTD : TD,
                        //     oModelPER : PER,
                        //     oModelACE : ACE, 
                        //     oModelPAImponibile: PAImponibile
                        // };
                        // var DataModel = new sap.ui.model.json.JSONModel();
                        // DataModel.setData(data);
                        // that.getView().setModel(DataModel, "oModelAnagrafica");
            },

            listaFunzionalita: function(oEvent){
                var key = oEvent.getSource().getProperty("key");
                var oRouter = this.getOwnerComponent().getRouter();
                
                if(key === 'C04'){
                    oRouter.navTo("TimeDiff", {
                        //ripresaID : oEvent.getSource().getBindingContext("oModelAnagrafica").getObject().codiceRipresa,
                        ID :  this.getView().getModel("computationModel").getData().ID,
                        imposta : this.getView().byId("impostaButton").getSelectedKey()
                    }, false);
                }if(key === 'C05'){
                    oRouter.navTo("DTLDTA", {
                        //ripresaID : oEvent.getSource().getBindingContext("oModelAnagrafica").getObject().codiceRipresa,
                        ID :  this.getView().getModel("computationModel").getData().ID,
                        imposta : this.getView().byId("impostaButton").getSelectedKey()
                    }, false);
                }if(key === 'C06'){
                    oRouter.navTo("Riprese", {
                        ripresaID : oEvent.getSource().getBindingContext("oModelAnagrafica").getObject().codiceRipresa,
                        ID :  this.getView().getModel("computationModel").getData().ID,
                        imposta : this.getView().byId("impostaButton").getSelectedKey()
                    }, false);
                }if(key === 'C07'){
                    oRouter.navTo("Riprese", {
                        ripresaID : oEvent.getSource().getBindingContext("oModelAnagrafica").getObject().codiceRipresa,
                        ID :  this.getView().getModel("computationModel").getData().ID,
                        imposta : this.getView().byId("impostaButton").getSelectedKey()
                        //conf : this.getView().getModel("computationModel").getData().conf
                    }, false);
                }
                this.getView().byId("navigationList")
            },

            _onObjectMatched: function (oEvent) {
                var oEvent = oEvent.getParameter("arguments");
                
                var ID = oEvent.ID; //ID computazione
                //var conf = oEvent.conf;

                this.getView().setModel(new JSONModel({
                    "ID": ID
                   // "conf": conf //ID computazione
                  }), "computationModel");

                var imposta = this.getView().byId("impostaButton").getSelectedKey();
                var that = this;
                //if(conf != "false"){
                    jQuery.ajax({
                        url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TotRipresaView?$count=true&$filter=computationId eq "+ID+" and imposta eq '"+imposta+"'"),
                        contentType: "application/json",
                        type: 'GET',
                        dataType: "json",
                        async: false,
                        success: function (oCompleteEntry) {
                            var arr = oCompleteEntry.value;
                            var PA = arr.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'A');
                            var PD = arr.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'D');
                            var TA = arr.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'A');
                            var TD = arr.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'D');
                            var PER = arr.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'PER');
                            var ACE = arr.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'ACE');
                            var PAImponibile = 0;
                            for (var i = 0; i < PA.length; i++) {
                                PAImponibile += PA[i].imponibile;
                            }
                            var PDImponibile = 0;
                            for (var i = 0; i < PD.length; i++) {
                                PDImponibile += PD[i].imponibile;
                            }
                            var TAImponibile = 0;
                            for (var i = 0; i < TA.length; i++) {
                                TAImponibile += TA[i].imponibile;
                            }
                            var TDImponibile = 0;
                            for (var i = 0; i < TD.length; i++) {
                                TDImponibile += TD[i].imponibile;
                            }
                            var PERImponibile = 0; 
                            PERImponibile = PAImponibile + PDImponibile + TAImponibile + TDImponibile + that.getView().getModel("headerModel").oData.oModel[0].imponibile;
                            // for (var i = 0; i < PER.length; i++) {
                            //     PERImponibile += PER[i].imponibile;
                            // }
                            var ACEImponibile = 0;
                            // for (var i = 0; i < ACE.length; i++) {
                            //     ACEImponibile += ACE[i].imponibile;
                            // }
                            for (var i = 0; i <  PER.length; i++) {
                                ACEImponibile += PER[i].imponibile;
                            }
                            ACEImponibile += PERImponibile ;

                            var RedditoImponibile = 0;
                            for (var i = 0; i < ACE.length; i++) {
                                RedditoImponibile += ACE[i].imponibile;
                            }
                            RedditoImponibile += ACEImponibile; //questo valore va salvato, quindi serve su backend
                            var data = {
                                oModelPA : PA,
                                oModelPD : PD,
                                oModelTA : TA,
                                oModelTD : TD,
                                oModelPER : PER,
                                oModelACE : ACE, 
                                oModelPAImponibile: PAImponibile,
                                oModelPDImponibile: PDImponibile,
                                oModelTAImponibile: TAImponibile,
                                oModelTDImponibile: TDImponibile,
                                oModelPERImponibile: PERImponibile, 
                                oModelACEImponibile: ACEImponibile, 
                                oModelRedditoImponibile: RedditoImponibile
                            };
                            var DataModel = new sap.ui.model.json.JSONModel();
                            DataModel.setData(data);
                            that.getView().setModel(DataModel, "oModelAnagrafica");
                        },
                        error: function (error) {
                            sap.m.MessageToast.show("Error");
                        }
                    });
               /* }else{
                    jQuery.ajax({
                        url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TotaliRipresaNoConf?$expand=codiceRipresa&$filter=imposta eq '"+imposta+"' and ID eq "+ID+""),
                        contentType: "application/json",
                        type: 'GET',
                        dataType: "json",
                        async: false,
                        success: function (oCompleteEntry) {
                            var arr = oCompleteEntry.value;
                            
                            var aItems = arr.map((arr) => {
                                return {
                                codiceRipresa: arr.codiceRipresa.ID,
                                descrizioneRipresa: arr.codiceRipresa.descrizioneRipresa,
                                imponibile: 0,
                                tipoVariazione: arr.codiceRipresa.tipoVariazione,
                                tipologia: arr.codiceRipresa.tipologia, 
                                imponibile: arr.totaleRipresa
                                };
                            });
                            var PA = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'A');
                            var PD = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'D');
                            var TA = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'A');
                            var TD = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'D');
                            var PER = aItems.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'PER');
                            var ACE = aItems.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'ACE');
                            var PAImponibile = 0;
                            for (var i = 0; i < PA.length; i++) {
                                PAImponibile += PA[i].imponibile;
                            }
                            var PDImponibile = 0;
                            for (var i = 0; i < PD.length; i++) {
                                PDImponibile += PD[i].imponibile;
                            }
                            var TAImponibile = 0;
                            for (var i = 0; i < TA.length; i++) {
                                TAImponibile += TA[i].imponibile;
                            }
                            var TDImponibile = 0;
                            for (var i = 0; i < TD.length; i++) {
                                TDImponibile += TD[i].imponibile;
                            }
                            var PERImponibile = 0;
                            for (var i = 0; i < PER.length; i++) {
                                PERImponibile += PER[i].imponibile;
                            }
                            var ACEImponibile = 0;
                            for (var i = 0; i < ACE.length; i++) {
                                ACEImponibile += ACE[i].imponibile;
                            }
                            var data = {
                                oModelPA : PA,
                                oModelPA : PA,
                                oModelPD : PD,
                                oModelTA : TA,
                                oModelTD : TD,
                                oModelPER : PER,
                                oModelACE : ACE, 
                                oModelPAImponibile: PAImponibile,
                                oModelPDImponibile: PDImponibile,
                                oModelTAImponibile: TAImponibile,
                                oModelTDImponibile: TDImponibile,
                                oModelPERImponibile: PERImponibile,
                                oModelACEImponibile: ACEImponibile
                            }
                            var DataModel = new sap.ui.model.json.JSONModel();
                            DataModel.setData(data);
                            that.getView().setModel(DataModel, "oModelAnagrafica");
                        },
                        error: function (error) {
                            sap.m.MessageToast.show("Error");
                        }
                    });
                    // jQuery.ajax({
                    //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/ComputazioneNoConfListaRiprese?$expand=codiceRipresa&$filter=imposta eq '"+imposta+"' and computation_ID eq "+ID+""),
                    //     contentType: "application/json",
                    //     type: 'GET',
                    //     dataType: "json",
                    //     async: false,
                    //     success: function (oCompleteEntry) {
                    //         var arr = oCompleteEntry.value;
                            
                    //         var aItems = arr.map((arr) => {
                    //             return {
                    //             codiceRipresa: arr.codiceRipresa.ID,
                    //             descrizioneRipresa: arr.codiceRipresa.descrizioneRipresa,
                    //             imponibile: 0,
                    //             tipoVariazione: arr.codiceRipresa.tipoVariazione,
                    //             tipologia: arr.codiceRipresa.tipologia
                    //             };
                    //         });
                    //         var PA = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'A');
                    //         var PD = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'P' && codiceRipresa.tipoVariazione === 'D');
                    //         var TA = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'A');
                    //         var TD = aItems.filter(codiceRipresa => codiceRipresa.tipologia === 'T' && codiceRipresa.tipoVariazione === 'D');
                    //         var PER = aItems.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'PER');
                    //         var ACE = aItems.filter(codiceRipresa => codiceRipresa.tipoVariazione === 'ACE');
                    //         var data = {
                    //             oModelPA : PA,
                    //             oModelPA : PA,
                    //             oModelPD : PD,
                    //             oModelTA : TA,
                    //             oModelTD : TD,
                    //             oModelPER : PER,
                    //             oModelACE : ACE
                    //         }
                    //         var DataModel = new sap.ui.model.json.JSONModel();
                    //         DataModel.setData(data);
                    //         that.getView().setModel(DataModel, "oModelAnagrafica");
                    //     },
                    //     error: function (error) {
                    //         sap.m.MessageToast.show("Error");
                    //     }
                    // });
                }*/

                this._setTitle();
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
            },

            _setTitle: function(){
                var that = this;
                var ID = this.getView().getModel("computationModel").getData().ID;
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Computations?$filter=ID eq "+ID+""),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var data = {
                            oModelDescrizione: oCompleteEntry.value[0].descrizione,
                            oModelConfigurazioneID: oCompleteEntry.value[0].Configurazione_ID,
                        }
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelDescrizione");
                        that._setPercentuale();
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
            },

            _setPercentuale: function(){
                var that = this;
                //var ID = this.getView().getModel("computationModel").getData().ID;
                var configurazioneID = this.getView().getModel("oModelDescrizione").getData().oModelConfigurazioneID;
                var imposta = this.getView().byId("impostaButton").getSelectedKey()
                //var conf = this.getView().getModel("computationModel").getData().conf;

            //     if(imposta === 'IRES'){
            //     jQuery.ajax({
            //         url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni?$filter=ID eq "+configurazioneID+"&$expand=confRegions"),
            //         contentType: "application/json",
            //         type: 'GET',
            //         dataType: "json",
            //         async: false,
            //         success: function (oCompleteEntry) {
            //             var data = {
            //                 oModelPercentuale: oCompleteEntry.value[0].confRegions[0].current
            //             }
            //             var DataModel = new sap.ui.model.json.JSONModel();
            //             DataModel.setData(data);
            //             that.getView().setModel(DataModel, "oModelPercentuale");
            //         },
            //         error: function (error) {
            //             sap.m.MessageToast.show("Error");
            //         }
            //     });
            // }if(imposta === 'IRAP'){
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/RegionsAVGView?$filter=configurazioneID eq "+configurazioneID+" and imposta eq '"+imposta+"'"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var data = {
                            oModelPercentuale: oCompleteEntry.value[0].currentAvg
                        }
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelPercentuale");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });                
            //}
            /*}else{

                this.getView().setModel(new JSONModel({
                    "oModelPercentuale": 0
                  }), "oModelPercentuale");

            }*/
            }
        });
    });
