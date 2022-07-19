sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/json/JSONModel',
    "./BaseController",
    "../model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, BaseController, formatter) {
        "use strict";
        //var aFilter = [];

        return BaseController.extend("tax.provisioning.computations.Creation.controller.Creation", {
            formatter: formatter,
            onInit: function () {
                
                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                this._oNavContainer = this.byId("wizardNavContainer");

                

                this._parameterSetting();
            },

            

            onValueChanged: function(oEvent){
                var oModel = this.getView().getModel("oModelTaxIRAP").getData();

                var totale = 0;
                var imponibili = 0;

                for(var i = 0; i < oModel.length; i++){
                    if(isNaN(parseFloat(oModel[i].imponibile)))
                    {
                        imponibili = 0;
                    }
                    else{
                        imponibili = parseFloat(oModel[i].imponibile)
                        totale += imponibili;
                    }
                }
                
                var DataModel = new sap.ui.model.json.JSONModel();
                DataModel.setData({"totale": totale});
                this.getView().setModel(DataModel, "oModelTaxIRAPTotale");
            },

            filterValidation: function () {
                var aFilter = [];
                var societa = this.getView().byId("societa").getValue();
                var ledger = this.getView().byId("ledger").getValue();
                var periodo = this.getView().byId("periodo").getValue();
                var descrizione = this.getView().byId("inputDescrizione").getValue();               
    
                if (societa && periodo && ledger && descrizione) {
                    aFilter.push(new Filter("societa", "EQ", societa));
                    aFilter.push(new Filter("ledger", "EQ", ledger));
                    aFilter.push(new Filter("periodo", "EQ", periodo));
                    this.getView().byId("societa").setValueState("None")
                    this.getView().byId("ledger").setValueState("None")
                    this.getView().byId("periodo").setValueState("None")
                    this.getView().byId("inputDescrizione").setValueState("None")
                    this._filterTableCreation(aFilter);
                   
                    this.getView().getModel("parameterModel").oData.societa = societa;
                    this.getView().getModel("parameterModel").oData.periodo = periodo;
                    this.getView().getModel("parameterModel").oData.ledger = ledger;
                    this.getView().getModel("parameterModel").oData.descrizione = descrizione;

                    this.getView().byId("smartForm").setBlocked(true);
                } else {
                    sap.m.MessageToast.show("Selezionare i campi");
                    var oWizard = this.byId("CreateWizard");
                    var oFirstStep = oWizard.getSteps()[0];
                    oWizard.discardProgress(oFirstStep);
                    if(!societa)
                    this.getView().byId("societa").setValueState("Error")
                    if(!ledger)
                    this.getView().byId("ledger").setValueState("Error")
                    if(!periodo)
                    this.getView().byId("periodo").setValueState("Error")
                    if(!descrizione)
                    this.getView().byId("inputDescrizione").setValueState("Error")
                }
            },

            filterValidation2: function (oEvent) {
                var oTable = this.getView().byId("versioniTable");
                var sSelectedPath = oTable.getSelectedItem();
                if(sSelectedPath != null){
                    var sSelectedPath = oTable.getSelectedItem().getBindingContext("tableModel").getPath().split("/oModel/")[1];
                    var oItem = oTable.getSelectedItem().getModel("tableModel").oData.oModel[sSelectedPath];

                    var versioneID = oItem.ID;
                   
                    this.getView().getModel("parameterModel").oData.idVersione = versioneID;
                    var aFilter = [];
                    aFilter.push(this.getView().getModel("parameterModel").oData.societa);
                    aFilter.push(this.getView().getModel("parameterModel").oData.ledger);
                    aFilter.push(this.getView().getModel("parameterModel").oData.periodo);

                    this._filterTableConf(aFilter);
                    // this.getView().byId("finishButton").setVisible(true);
                    // this.getView().byId("nextStepButton").setVisible(false);
                    this.getView().byId("trialBalance").setBlocked(true);
                }else {
                    sap.m.MessageToast.show("Selezionare un trial balance");
                    var oWizard = this.byId("CreateWizard");
                    var oFirstStep = oWizard.getSteps()[1];
                    oWizard.discardProgress(oFirstStep);
                }
            },


            filterValidation3: function (oEvent) {
                var oTable = this.getView().byId("taxRulesTable");
                var sSelectedPath = oTable.getSelectedItem();
                if(sSelectedPath != null){
                    var sSelectedPath = oTable.getSelectedItem().getBindingContext("taxRuleModel").getPath().split("/oModel/")[1];
                    var oItem2 = oTable.getSelectedItem().getModel("taxRuleModel").oData.oModel[sSelectedPath];
                    this.getView().getModel("parameterModel").oData.idConfigurazione = oItem2.ID; 

                    //var versioneID = oItem.ID;
                   
                    //this.getView().getModel("parameterModel").oData.idVersione = versioneID;
                    

                    this._filterTableTax();

                }else {
                    sap.m.MessageToast.show("Selezionare una tax rule");
                    var oWizard = this.byId("CreateWizard");
                    var oFirstStep = oWizard.getSteps()[2];
                    oWizard.discardProgress(oFirstStep);
                }
            },

            filterValidation4: function(oEvent){
                var modelloIRES = this.getView().getModel("oModelTaxIRES").getData();
                var modelloIRAP = this.getView().getModel("oModelTaxIRAP").getData();

                var aIRAPNOImponibile = modelloIRAP.map((arr) => {

                        
                    return {
                        current: arr.current,
                        current1: arr.current1,
                        current2: arr.current2,
                        current3: arr.current3,
                        current4: arr.current4,                          
                    };
            });

                var checkIRES = modelloIRES.some(element => Object.values(element).some(val => val <= 0 || val >= 100));
                var checkIRAP = aIRAPNOImponibile.some(element => Object.values(element).some(val => val <= 0 || val >= 100));

                //var checkIRES = false;
                //var checkIRAP = false;

                if(!checkIRES && !checkIRAP){

                    var aFilter = [];
                    aFilter.push(this.getView().getModel("parameterModel").oData.societa);
                    aFilter.push(this.getView().getModel("parameterModel").oData.ledger);
                    aFilter.push(this.getView().getModel("parameterModel").oData.periodo);

                    this._filterTableCompConfronto(aFilter);
                    this.getView().byId("finishButton").setVisible(true);
                    this.getView().byId("nextStepButton").setVisible(false);
                    this.getView().byId("taxRule").setBlocked(true);


                    
                }
                else{
                    
                    sap.m.MessageToast.show("Verificare campi inseriti");
                    var oWizard = this.byId("CreateWizard");
                    var oFirstStep = oWizard.getSteps()[3];
                    oWizard.discardProgress(oFirstStep);
                    
                }    
                
                

            },

            _filterTableTax: function(){
                var that = this;
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Regions"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
          

                        var dataIRES = oCompleteEntry.value.filter(function(oItem){return oItem.imposta === "IRES"});

                        var modelIRES = dataIRES.map((arr) => {

                        
                            return {
                                ID: arr.ID,
                                descrizione: arr.descrizione,
                                imposta: arr.imposta,
                                current: null,
                                current1: null,
                                current2: null,
                                current3: null,
                                current4: null                           
                            };
                        });

                        var dataIRAP = oCompleteEntry.value.filter(function(oItem){return oItem.imposta === "IRAP"});

                        var modelIRAP = dataIRAP.map((arr) => {

                        
                            return {
                                ID: arr.ID,
                                descrizione: arr.descrizione,
                                imposta: arr.imposta,
                                current: null,
                                current1: null,
                                current2: null,
                                current3: null,
                                current4: null,
                                imponibile: null                           
                            };
                    });
                        var DataModelIRES = new sap.ui.model.json.JSONModel();
                        var DataModelIRAP = new sap.ui.model.json.JSONModel();
                        DataModelIRES.setData(modelIRES);
                        DataModelIRAP.setData(modelIRAP);
                        that.getView().setModel(DataModelIRES, "oModelTaxIRES");
                        that.getView().setModel(DataModelIRAP, "oModelTaxIRAP");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
            },

            handleFinishSelection: function(){
                var oTable = this.getView().byId("confConfrontoTable");
                var sSelectedPath = oTable.getSelectedItem();
                if(sSelectedPath != null){
                    var sSelectedPath = oTable.getSelectedItem().getBindingContext("confCompModel").getPath().split("/oModel/")[1];
                    var oItem2 = oTable.getSelectedItem().getModel("confCompModel").oData.oModel[sSelectedPath];
                    this.getView().getModel("parameterModel").oData.idCompConfronto = oItem2.ID; 

                    return true;
                }
                else {
                    // sap.m.MessageToast.show("Selezionare una tax rule");
                    // var oWizard = this.byId("CreateWizard");
                    // var oFirstStep = oWizard.getSteps()[2];
                    // oWizard.discardProgress(oFirstStep);

                    return true;
                }
            },

            //funzione per salvare la computazione da richiamare nell'ultimo step
            handleWizardSubmit: function (oEvent) {
                if(this.handleFinishSelection()){
                    var that = this;
                    var descrizioneComputation = this.getView().getModel("parameterModel").oData.descrizione;
                    var idConfigurazione = this.getView().getModel("parameterModel").oData.idConfigurazione;
                    var idVersione = this.getView().getModel("parameterModel").oData.idVersione;
                    var idCompConfronto = this.getView().getModel("parameterModel").oData.idCompConfronto;

                    var irap=this.getView().getModel("oModelTaxIRAP").getData();
                    var ires=this.getView().getModel("oModelTaxIRES").getData();
                    var itemRegion = irap.concat(ires);

                    var confRegions = itemRegion.map((arr) => {

                        
                        return {
                            region_ID: arr.ID,
                            current: arr.current,
                            current1: arr.current1,
                            current2: arr.current2,
                            current3: arr.current3,
                            current4: arr.current4,
                            imponibilePrevidenziale: arr.imponibile                           
                        };
                });
    
                    var nuovaComputation = JSON.stringify({"descrizione": descrizioneComputation, "Configurazione_ID": idConfigurazione, "Versione_ID": idVersione, "compConfronto": idCompConfronto, "confRegions": confRegions });

                    jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Computations"),
                    contentType: "application/json",
                    type: 'POST',
                    dataType: "json",
                    data: nuovaComputation,
                    async: false,
                    success: function (oCompleteEntry) {
                        sap.m.MessageToast.show("Success");
    
                        var oWizard = that.byId("CreateWizard");
                        var oFirstStep = oWizard.getSteps()[0];
                        oWizard.discardProgress(oFirstStep);
                        oWizard.goToStep(oFirstStep);
                        oFirstStep.setValidated(true);
                        that.getView().byId("smartForm").setBlocked(false);

                        that._resetFields();

                        var IdComputazione = oCompleteEntry.ID                        
                        
                        // var oRouter = that.getOwnerComponent().getRouter();
                        // oRouter.navTo("Home");

                        that.getRouter().navTo(
                            "CurrentTax",
                            {
                              ID: IdComputazione,
                            },
                            false
                          );
    
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                    });                    
                }
                /*else{
                    var that = this;
                    var descrizioneComputation = this.getView().getModel("parameterModel").oData.descrizione;
                    //var idConfigurazione = this.getView().getModel("parameterModel").oData.idConfigurazione;
                    var idVersione = this.getView().getModel("parameterModel").oData.idVersione;
    
                    var nuovaComputation = JSON.stringify({"descrizione": descrizioneComputation, "Versione_ID": idVersione });
    
                    jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Computations"),
                    contentType: "application/json",
                    type: 'POST',
                    dataType: "json",
                    data: nuovaComputation,
                    async: false,
                    success: function (oCompleteEntry) {
                        sap.m.MessageToast.show("Success");
                        var computazioneID = JSON.stringify({"id": oCompleteEntry.ID});

                        jQuery.ajax({
                            url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/creaComputazioneNoConf"),
                            contentType: "application/json",
                            type: 'POST',
                            dataType: "json",
                            data: computazioneID,
                            async: false,
                            success: function (oCompleteEntry) {
                                // sap.m.MessageToast.show("Success");
            
                                // var oWizard = that.byId("CreateWizard");
                                // var oFirstStep = oWizard.getSteps()[0];
                                // oWizard.discardProgress(oFirstStep);
                                // oWizard.goToStep(oFirstStep);
                                // oFirstStep.setValidated(true);
                                // that.getView().byId("smartForm").setBlocked(false);
        
                                // that._resetFields();

                                // var oRouter = that.getOwnerComponent().getRouter();
                                // oRouter.navTo("View1");
                            },
                            error: function (error) {
                                sap.m.MessageToast.show("Error");
                            }
                            });    
                        var oWizard = that.byId("CreateWizard");
                        var oFirstStep = oWizard.getSteps()[0];
                        oWizard.discardProgress(oFirstStep);
                        oWizard.goToStep(oFirstStep);
                        oFirstStep.setValidated(true);
                        that.getView().byId("smartForm").setBlocked(false);

                        that._resetFields();
                        var oRouter = that.getOwnerComponent().getRouter();
                        oRouter.navTo("View1");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                    });                    
                }*/
            },

            onCloseVersione: function (oEvent) {
                this.byId("DialogSalva").close();
            },

            firstStepActivation: function () {
                //var oModel = this.getView().getModel();
                this._oWizard = this.byId("CreateWizard");
                this._oWizard.setCurrentStep(this.byId("sceltaParametri"));
            },

            handleNavigationChange: function (oEvent) {
                this._oSelectedStep = oEvent.getParameter("step");
                this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
                //this.handleButtonsVisibility();
            },

            onDialogNextButton: function () {
                this._oWizard = this.byId("CreateWizard");
                
                var stepName = this._oWizard._getCurrentStepInstance().sId;
                if(stepName === 'application-taxprovisioningcomputations-display-component---Creation--sceltaParametri'){
                    this._iSelectedStepIndex = 0;
                    
                }
                if(stepName === 'application-taxprovisioningcomputations-display-component---Creation--trialBalance'){
                    this._iSelectedStepIndex = 1;
                    //this.filterValidation2();
                    
                }
                if(stepName === 'application-taxprovisioningcomputations-display-component---Creation--taxRule'){
                    this._iSelectedStepIndex = 2;
                    // this.getView().byId("nextStepButton").setVisible(false);
                    // this.getView().byId("finishButton").setVisible(true);
                    // this.handleWizardSubmit();
                    
                }
                if(stepName === 'application-taxprovisioningcomputations-display-component---Creation--confConfronto'){
                    this._iSelectedStepIndex = 3;
                    this.getView().byId("nextStepButton").setVisible(false);
                    this.getView().byId("finishButton").setVisible(true);
                    this.handleWizardSubmit();
                    
                }

                this._oSelectedStep = this._oWizard.getSteps()[this._iSelectedStepIndex];
                
                this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
                var oNextStep = this._oWizard.getSteps()[this._iSelectedStepIndex + 1];
    
                
                if (this._oSelectedStep && !this._oSelectedStep.bLast) {
                    this._oWizard.goToStep(oNextStep, true);
                } else {
                    this._oWizard.nextStep();
                }
    
                this._iSelectedStepIndex = this._iSelectedStepIndex + 1;
                this._oSelectedStep = oNextStep;
            },

            handleWizardCancel: function(){
                this._resetFields();
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Home");
            },

            _filterTableCreation: function (aFilter) {
                    var that = this;
                    var societa = aFilter[0].oValue1;
                    var ledger = aFilter[1].oValue1;
                    var periodo = aFilter[2].oValue1;

                    //var oModel = this.getOwnerComponent().getModel("computationsModel");
                    
                    jQuery.ajax({
                        url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Versioni?$filter=societa eq '"+societa+"' and ledger eq '"+ledger+"' and periodo eq '"+periodo+"'"),
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
                            that.getView().setModel(DataModel, "tableModel");
                        },
                        error: function (error) {
                            sap.m.MessageToast.show("Error");
                        }
                    });
                    // oModel.read("/Versioni", {
                    //     filters: aFilter,
                    //     success: function (oData, response) {
                    //         var data = {
                    //             oModel: oData.results
                    //         };
                    //         var DataModel = new sap.ui.model.json.JSONModel();
                    //         DataModel.setData(data);
                    //         that.getView().setModel(DataModel, "tableModel");
                    //     },

                    //     error: function (response) {
                    //         sap.m.MessageToast.show("Error");
                    //     }
                    // });
            },

            _filterTableConf: function (aFilter) {
                var that = this;
                var societa = aFilter[0];
                var ledger = aFilter[1];
                var periodo = aFilter[2];

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni?$filter=societa eq '"+societa+"' and ledger eq '"+ledger+"' and periodo eq '"+periodo+"'"), //filtro solo per la tripletta
                    // url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni?$filter=versione_ID eq "+versioneID+"&societa eq '"+societa+"'&ledger eq '"+ledger+"'&periodo eq '"+periodo+"'"), //qui filtro anche per versione
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
                        that.getView().setModel(DataModel, "taxRuleModel");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });

                // oModel.read("/Configurazioni", {
                //     filters: aFilter,
                //     success: function (oData, response) {
                //         var data = {
                //             oModel: oData.results
                //         };
                //         var DataModel = new sap.ui.model.json.JSONModel();
                //         DataModel.setData(data);
                //         that.getView().setModel(DataModel, "taxRuleModel");
                //     },

                //     error: function (response) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });
        },

        _filterTableCompConfronto: function (aFilter) {
                var that = this;
                var societa = aFilter[0];
                var ledger = aFilter[1];
                var periodo = aFilter[2];
                periodo = periodo.substring(0,4).concat(periodo.substring(4,6)-1)

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Computations?$expand=Versione&$filter=Versione/periodo eq '"+periodo+"' and Versione/societa eq '"+societa+"' and Versione/ledger eq '"+ledger+"' "), //filtro solo per la tripletta
                    // url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/Configurazioni?$filter=versione_ID eq "+versioneID+"&societa eq '"+societa+"'&ledger eq '"+ledger+"'&periodo eq '"+periodo+"'"), //qui filtro anche per versione
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        debugger;
                        var data = {
                            oModel: oCompleteEntry.value
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "confCompModel");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });

                // oModel.read("/Configurazioni", {
                //     filters: aFilter,
                //     success: function (oData, response) {
                //         var data = {
                //             oModel: oData.results
                //         };
                //         var DataModel = new sap.ui.model.json.JSONModel();
                //         DataModel.setData(data);
                //         that.getView().setModel(DataModel, "taxRuleModel");
                //     },

                //     error: function (response) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });
        },

        _parameterSetting: function(){
            this.getView().setModel(new JSONModel({
                // "societa": "",
                // "ledger": "",
                // "periodo": "",
                // "descrizione": "",
                // "idVersione": "",
                // "idConfigurazione": ""
              }), "parameterModel");
            },
        
        _resetFields: function () {

            var oWizard = this.byId("CreateWizard");
            var oFirstStep = oWizard.getSteps()[0];
            oWizard.discardProgress(oFirstStep);

            this.getView().byId("smartForm").setBlocked(false);
            this.getView().byId("trialBalance").setBlocked(false);
            this.getView().byId("taxRule").setBlocked(false);

            this.getView().byId("nextStepButton").setVisible(true);
            this.getView().byId("finishButton").setVisible(false);

            this.getView().byId("societa").setValue("");
            this.getView().byId("ledger").setValue("");
            this.getView().byId("periodo").setValue("");
            this.getView().byId("inputDescrizione").setValue("");
            }
        });
    });
