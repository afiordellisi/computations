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
        var aParameterSet = [];
        var aFilter = [];
        

        return Controller.extend("tax.provisioning.computations.Creation.controller.View1", {
            onInit: function () {

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                this._oNavContainer = this.byId("wizardNavContainer");

                this._parameterSetting();
            },

            filterValidation: function () {
                debugger;

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
                debugger;
                var oTable = this.getView().byId("versioniTable");
                var sSelectedPath = oTable.getSelectedItem();
                if(sSelectedPath != null){
                    var sSelectedPath = oTable.getSelectedItem().getBindingContext("tableModel").getPath().split("/oModel/")[1];
                    var oItem = oTable.getSelectedItem().getModel("tableModel").oData.oModel[sSelectedPath];

                    this.getView().getModel("parameterModel").oData.idVersione = oItem.ID;
                    this._filterTableConf(aFilter);
                    this.getView().byId("finishButton").setVisible(true);
                    this.getView().byId("nextStepButton").setVisible(false);
                    this.getView().byId("trialBalance").setBlocked(true);
                }else {
                    sap.m.MessageToast.show("Selezionare un trial balance");
                    var oWizard = this.byId("CreateWizard");
                    var oFirstStep = oWizard.getSteps()[1];
                    oWizard.discardProgress(oFirstStep);
                }
                
            },

            handleFinishSelection: function(){
                var oTable = this.getView().byId("taxRulesTable");
                var sSelectedPath = oTable.getSelectedItem();
                if(sSelectedPath != null){
                    var sSelectedPath = oTable.getSelectedItem().getBindingContext("taxRuleModel").getPath().split("/oModel/")[1];
                    var oItem2 = oTable.getSelectedItem().getModel("taxRuleModel").oData.oModel[sSelectedPath];
                    this.getView().getModel("parameterModel").oData.idConfigurazione = oItem2.ID; 

                    return true;
                }else {
                    sap.m.MessageToast.show("Selezionare una tax rule");
                    var oWizard = this.byId("CreateWizard");
                    var oFirstStep = oWizard.getSteps()[2];
                    oWizard.discardProgress(oFirstStep);

                    return false;
                }
            },

            


            //funzione per salvare la computazione da richiamare nell'ultimo step
            handleWizardSubmit: function (oEvent) {
                //this.handleFinishSelection();
                debugger;
                if(this.handleFinishSelection()){
                    debugger;
                    var that = this;
                    var descrizioneComputation = this.getView().getModel("parameterModel").oData.descrizione;
                    var idConfigurazione = this.getView().getModel("parameterModel").oData.idConfigurazione;
                    var idVersione = this.getView().getModel("parameterModel").oData.idVersione;
    
                    var nuovaComputation = JSON.stringify({"descrizione": descrizioneComputation, "Configurazione_ID": idConfigurazione, "Versione_ID": idVersione });
    
                    jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/computation/Computations"),
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
                        
                        debugger;
                        
                        var oRouter = that.getOwnerComponent().getRouter();
                        oRouter.navTo("RouteView1");
    
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                    });                    
                }
                

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
                    debugger;
                }
                if(stepName === 'application-taxprovisioningcomputations-display-component---Creation--trialBalance'){
                    this._iSelectedStepIndex = 1;
                    //this.filterValidation2();
                    debugger;
                }
                if(stepName === 'application-taxprovisioningcomputations-display-component---Creation--taxRule'){
                    this._iSelectedStepIndex = 2;
                    this.getView().byId("nextStepButton").setVisible(false);
                    this.getView().byId("finishButton").setVisible(true);
                    this.handleWizardSubmit();
                    debugger;
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
                oRouter.navTo("RouteView1");
            },

            _filterTableCreation: function (aFilter) {
                    var that = this;

                    var oModel = this.getOwnerComponent().getModel("computationsModel");

                    oModel.read("/Versioni", {
                        filters: aFilter,
                        success: function (oData, response) {
                            var data = {
                                oModel: oData.results
                            };
                            var DataModel = new sap.ui.model.json.JSONModel();
                            DataModel.setData(data);
                            that.getView().setModel(DataModel, "tableModel");
                        },

                        error: function (response) {
                            sap.m.MessageToast.show("Error");
                        }
                    });
            },

            _filterTableConf: function (aFilter) {
                var that = this;

                var oModel = this.getOwnerComponent().getModel("computationsModel");

                oModel.read("/Configurazioni", {
                    filters: aFilter,
                    success: function (oData, response) {
                        var data = {
                            oModel: oData.results
                        };
                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "taxRuleModel");
                    },

                    error: function (response) {
                        sap.m.MessageToast.show("Error");
                    }
                });
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

            this.getView().byId("nextStepButton").setVisible(true);
            this.getView().byId("finishButton").setVisible(false);

            this.getView().byId("societa").setValue("");
            this.getView().byId("ledger").setValue("");
            this.getView().byId("periodo").setValue("");
            this.getView().byId("inputDescrizione").setValue("");
           
            }
        });
    });
