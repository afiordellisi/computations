sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Fragment',
    "sap/ui/core/routing/History",
    './BaseController',
    "sap/m/library"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, Fragment, History, BaseController, mobileLibrary) {
        "use strict";
        var codiceGL;
        var ripresaID;
        var versioneID;
        var configurazioneID;
        var computazioneID;
        var descrizioneGL;
        var URLHelper = mobileLibrary.URLHelper;
        var file;

        return BaseController.extend("tax.provisioning.computations.controller.Allegati", {
            onInit: function () {
                //this._bDescendingSort = false;
                //this.oProductsTable = this.oView.byId("productsTable");
                this.oModel = this.getOwnerComponent().getModel();
                this.getOwnerComponent().getRouter().getRoute("Allegati").attachPatternMatched(this._onObjectMatched, this);

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;
                //this.getView().getModel("oModelAnagrafica");

                this.oView = this.getView();

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                //this._setTestataAllegati();

                //var sPath = sap.ui.require.toUrl("computations/webapp/localService/items.json"),
                //oUploadSet = this.byId("UploadSet");

                //this.getView().setModel(new JSONModel(sPath));

                // Modify "add file" button
                // oUploadSet.getDefaultFileUploader().setButtonOnly(false);
                // oUploadSet.getDefaultFileUploader().setTooltip("");
                // oUploadSet.getDefaultFileUploader().setIconOnly(true);
                // oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment");
            },

            _setTableAllegati: function (ripresaID, codiceGL, computazioneID) {
                var that = this;
                var codiceGL = codiceGL;
                var ripresaID = ripresaID;
                // var descrizioneGL = descrizioneGL;
                var computazioneID = computazioneID;
                var testata = [codiceGL];


                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AllegatiRipresa?$expand=computation,ripresa&$filter=computation_ID eq " + computazioneID + " and ripresa_ID eq '" + ripresaID + "' and codiceGL eq '" + codiceGL + "'"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var linkArray = [];
                        for (var i = 0; i < oCompleteEntry.value.length; i++) {
                            linkArray.push(oCompleteEntry.value[i].ID)
                        }
                        var data = {
                            oModel: oCompleteEntry.value,
                            oModelTestata: testata,
                            oModelLink: linkArray
                        };

                        var DataModel = new sap.ui.model.json.JSONModel();
                        DataModel.setData(data);
                        that.getView().setModel(DataModel, "oModelTableAllegati");

                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
            },

            _onObjectMatched: function (oEvent) {
                var oEvent = oEvent.getParameter("arguments");

                computazioneID = oEvent.ID;
                codiceGL = oEvent.codiceGL;
                ripresaID = oEvent.ripresaID; //ID ripresa singola
                var imposta = oEvent.imposta;

                this.getView().setModel(new JSONModel({
                    "ID": computazioneID,
                    "ripresaID": ripresaID,
                    "codiceGL": codiceGL,
                    "imposta": imposta
                }), "routingModel");

                this._setTableAllegati(ripresaID, codiceGL, computazioneID);
                //this._setModelRouting(configurazioneID, ripresaID)
            },

            onSaveAllegato: function (oEvent) {
                if(this._validazioneAllegato()){
                var nuovoAllegato;
                var nuovoAllegato = JSON.stringify({
                    "descrizione": this.getView().byId("descrizioneAllegato").getValue(),
                    "importo": parseFloat(this.getView().byId("importoAllegato").getValue()),
                    //"notes": this.getView().byId("note").getValue(),
                    "computation_ID": computazioneID,
                    "ripresa_ID": ripresaID,
                    "codiceGL": codiceGL,
                    "fileName": this.getView().byId("fileUploader").getValue(),
                    "imposta": this.getView().getModel("routingModel").getData().imposta
                    //"mediaType": "text/plain"
                });

                var that = this;

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AllegatiRipresa"),
                    contentType: "application/json",
                    type: 'POST',
                    data: nuovoAllegato,
                    async: false,
                    success: function (oCompleteEntry) {
                        var ID = oCompleteEntry.ID //allegatoID
                        
                        that._putAllegato(ID)
                        that.onCloseConfigurazione();
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
                }else{
                    sap.m.MessageToast.show("Valorizzare i campi");
                    this.getView().byId("descrizioneAllegato").setValueState("Error");
                    this.getView().byId("importoAllegato").setValueState("Error");
                    this.getView().byId("note").setValueState("Error");
                }  
            },

            onNewAllegatoPress: function () {

                var oView = this.getView();
                if (!this._pDialogConf) {
                    this._pDialogConf = Fragment.load({
                        id: oView.getId(),
                        name: "tax.provisioning.computations.view.fragment.Dialog",
                        controller: this
                    }).then(function (oDialogConf) {
                        oView.addDependent(oDialogConf);
                        return oDialogConf;
                    });
                }
                this._pDialogConf.then(function (oDialogConf) {
                    //this._configDialog(oButton, oDialogConf);
                    oDialogConf.open();
                });

            },

            onNotePress: function(){
                var oView = this.getView();
                if (!this._pDialogConf) {
                    this._pDialogConf = Fragment.load({
                        id: oView.getId(),
                        name: "tax.provisioning.computations.view.fragment.Timeline",
                        controller: this
                    }).then(function (oDialogConf) {
                        oView.addDependent(oDialogConf);
                        return oDialogConf;
                    });
                }
                this._pDialogConf.then(function (oDialogConf) {
                    //this._configDialog(oButton, oDialogConf);
                    oDialogConf.open();
                });

            },

            onCloseConfigurazione: function (oEvent) {
                this.byId("DialogSalva").close();
                //this.byId("DialogSalva").destroy();
                this.byId("fileUploader").clear();

                this.byId("descrizioneAllegato").setValue("");
                this.byId("importoAllegato").setValue("");
                this._setTableAllegati(ripresaID, codiceGL, computazioneID)
            },

            onNavBack: function (oEvent) {
                this.getRouter().navTo("Riprese", {
                    ripresaID: ripresaID,
                    ID: computazioneID,
                    imposta: this.getView().getModel("routingModel").getData().imposta,
                });
            },

            change: function (oEvent) {
                this.getView().byId("fileUploader")
                file = oEvent.getParameters("files").files[0]
            },

            _putAllegato: function (ID, nuovoAllegato) {
                var that = this;
                var allegatoID = ID;
                var allegato = nuovoAllegato
                // var formData = new FormData()
                // formData.append('source', file)
                // debugger;
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AllegatiRipresa/" + allegatoID + "/content"),
                    //    contentType: "text/plain",
                    contentType: false,
                    type: 'PUT',
                    //  dataType: "json",
                    data: file,
                    processData: false,
                    async: false,
                    success: function (oCompleteEntry) {
                        sap.m.MessageToast.show("Success");
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
            },

            _linkAllegati: function (oEvent) {
                var allegatoID = oEvent.getSource().getBindingContext("oModelTableAllegati").getObject().ID;
                //var that = this;

                var url = jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/AllegatiRipresa/" + allegatoID + "/content ");
                // Require the URLHelper and open the URL in a new window or tab (same as _blank):
                URLHelper.redirect(url, true);


                // jQuery.ajax({
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/Computation/AllegatiRipresa/"+allegatoID+"/content "),
                //     contentType: "application/json",
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //         
                //         // var data = {
                //         //    oModel: oCompleteEntry,
                //         //    //oModelTestata: testata
                //         // };
                //         // var DataModel = new sap.ui.model.json.JSONModel();
                //         // DataModel.setData(data);
                //         // that.getView().setModel(DataModel, "oModelTableLinkAllegati");
                //     },
                //     error: function (error) {
                //         sap.m.MessageToast.show("Error");
                //     }
                // });
            },

            _validazioneAllegato: function(){
                var descriptionAllegato = this.getView().byId("descrizioneAllegato").getValue();
                var importo = this.getView().byId("importoAllegato").getValue();
                var note = this.getView().byId("note").getValue();
                if(descriptionAllegato && importo && note)
                return true;
                else
                return false;                
            }
        });
    });
