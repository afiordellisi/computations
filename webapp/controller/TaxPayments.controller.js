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
        var computazioneID;
        var URLHelper = mobileLibrary.URLHelper;
        var file;
        var tipo;

        return BaseController.extend("tax.provisioning.computations.controller.TaxPayments", {
            onInit: function () {
                //this._bDescendingSort = false;
                //this.oProductsTable = this.oView.byId("productsTable");
                this.oModel = this.getOwnerComponent().getModel();
                this.getOwnerComponent().getRouter().getRoute("TaxPayments").attachPatternMatched(this._onObjectMatched, this);

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

            _setTableAllegati: function (computazioneID, imposta) {
                var that = this;
                // var descrizioneGL = descrizioneGL;
                var computazioneID = computazioneID;


                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments?$expand=computation&$filter=computation_ID eq " + computazioneID + " and imposta eq '"+imposta+"'"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var linkArray = [];
                        for (var i = 0; i < oCompleteEntry.value.length; i++) {
                            linkArray.push(oCompleteEntry.value[i].ID)
                        }
                        var arr = oCompleteEntry.value;
                        var V = arr.filter(versamento => versamento.tipologia === 'V');
                        var C = arr.filter(versamento => versamento.tipologia === 'C');
                        var A = arr.filter(versamento => versamento.tipologia === 'A');
                        var O = arr.filter(versamento => versamento.tipologia === 'O');
                        var data = {
                            oModelV: V,
                            oModelC: C,
                            oModelA: A,
                            oModelO: O,
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
                var imposta = oEvent.imposta;

                this.getView().setModel(new JSONModel({
                    "ID": computazioneID,
                    "imposta": imposta
                }), "routingModel");

                this._setTableAllegati(computazioneID, imposta);
                //this._setModelRouting(configurazioneID, ripresaID)
            },

            onSaveAllegato: function (oEvent) {
                if(this._validazioneAllegato()){
                var nuovoAllegato;
                
                var nuovoAllegato = JSON.stringify({
                    "descrizione": this.getView().byId("descrizioneAllegato").getValue(),
                    "data": this.getView().byId("dataAllegato").getValue(),
                    "rata": this.getView().byId("rataAllegato").getValue(),
                    "codiceTributo": this.getView().byId("codiceTributoAllegato").getValue(),
                    "anno": this.getView().byId("annoAllegato").getValue(),
                    "ravvedimento": this.getView().byId("ravvedimentoAllegato").getValue(),
                    "importo": parseFloat(this.getView().byId("importoAllegato").getValue()),
                    "note": this.getView().byId("noteAllegato").getValue(),
                    "computation_ID": computazioneID,
                    "fileName": this.getView().byId("fileUploader").getValue(),
                    "imposta": this.getView().getModel("routingModel").getData().imposta,
                    "tipologia": tipo
                    //"mediaType": "text/plain"
                });

                var that = this;

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments"),
                    contentType: "application/json",
                    type: 'POST',
                    data: nuovoAllegato,
                    async: false,
                    success: function (oCompleteEntry) {
                        var ID = oCompleteEntry.ID //allegatoID
                        
                        //that._putAllegato(ID)
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

            onNewAllegatoPress: function (oEvent) {
                tipo = oEvent;
                var oView = this.getView();
                if (!this._pDialogConf) {
                    this._pDialogConf = Fragment.load({
                        id: oView.getId(),
                        name: "tax.provisioning.computations.view.fragment.TaxPaymentsRow",
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

            // onNotePress: function(){
            //     var oView = this.getView();
            //     if (!this._pDialogConf2) {
            //         this._pDialogConf2 = Fragment.load({
            //             id: oView.getId(),
            //             name: "tax.provisioning.computations.view.fragment.Timeline",
            //             controller: this
            //         }).then(function (oDialogConf2) {
            //             oView.addDependent(oDialogConf2);
            //             return oDialogConf2;
            //         });
            //     }
            //     this._pDialogConf2.then(function (oDialogConf2) {
            //         //this._configDialog(oButton, oDialogConf);
            //         oDialogConf2.open();
            //     });

            // },

            onCloseConfigurazione: function (oEvent) {
                    
                    this.byId("DialogSalva").close();
                    this.byId("fileUploader").clear();
                    this.byId("descrizioneAllegato").setValue("");
                    this.byId("importoAllegato").setValue("");
                    this._setTableAllegati(computazioneID, imposta)

                // if(this.byId("DialogSalva").getId().substring(90, 70) === 'DialogSalva'){
                //     this.byId("DialogSalva").close();
                //     this.byId("DialogSalva").dismiss();
                //     this.byId("fileUploader").clear();

                //     this.byId("descrizioneAllegato").setValue("");
                //     this.byId("importoAllegato").setValue("");
                //     this._setTableAllegati(ripresaID, codiceGL, computazioneID)
                // }else{
                //     this.byId("DialogSalva2").close();
                // }
            },

            onClose: function(){
                this.byId("DialogSalva2").close();
            },

            // onNavBack: function (oEvent) {
            //     this.getRouter().navTo("Riprese", {
            //         ripresaID: ripresaID,
            //         ID: computazioneID,
            //         imposta: this.getView().getModel("routingModel").getData().imposta,
            //     });
            // },

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
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments/" + allegatoID + "/content"),
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

                var url = jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments/" + allegatoID + "/content ");
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
                var note = this.getView().byId("noteAllegato").getValue();
                if(descriptionAllegato && importo && note)
                return true;
                else
                return false;                
            }
        });
    });
