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

            _setTableAllegati: function(computazioneID, ripresaID, codiceGL, descrizioneGL){
                var that = this;
                var codiceGL = codiceGL;
                var descrizioneGL = descrizioneGL;
                var computazioneID = computazioneID;
                var testata = [codiceGL, descrizioneGL];
                debugger;

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/Computation/AllegatiRipresa?$filter=computation_ID eq "+computazioneID+" and ripresa_ID eq '"+ripresaID+"' and codiceGL eq '"+codiceGL+"'"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var linkArray = [];
                        for(var i=0; i<oCompleteEntry.value.length; i++){
                            linkArray.push(oCompleteEntry.value[i].ID)
                        var data = {
                           oModel: oCompleteEntry.value,
                           oModelTestata: testata,
                           oModelLink: linkArray
                        };
                        }
                        
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
                debugger;
                computazioneID = oEvent.ID;
                codiceGL = oEvent.codiceGL;
                ripresaID = oEvent.ripresaID; //ID ripresa singola 
                versioneID = oEvent.versioneID; 
                configurazioneID = oEvent.configurazioneID; 
                descrizioneGL = oEvent.descrizioneGL;

                this._setTableAllegati(computazioneID, ripresaID, codiceGL, descrizioneGL);
            },

            onUploadSelectedButton: function () {
                var oUploadSet = this.byId("UploadSet");

                oUploadSet.getItems().forEach(function (oItem) {
                    if (oItem.getListItem().getSelected()) {
                        oUploadSet.uploadItem(oItem);
                    }
                });
            },
            onDownloadSelectedButton: function () {
                var oUploadSet = this.byId("UploadSet");

                oUploadSet.getItems().forEach(function (oItem) {
                    if (oItem.getListItem().getSelected()) {
                        oItem.download(true);
                    }
                });
            },

            onSaveAllegato: function(oEvent){
                var nuovoAllegato;
                
                //var oUploadSet = this.byId("UploadSet");

                //nuovoAllegato = {"content": this.byId("UploadSet").getItems()[0].getFileObject(), "mediaType":"text/plain" ,"fileName":"nav back example.txt" ,"importo": 10}

                debugger;

                var nuovoAllegato = JSON.stringify({
                    "descrizione": this.getView().byId("descrizioneAllegato").getValue(),
                    "importo": parseFloat(this.getView().byId("importoAllegato").getValue()),
                    "computation_ID": computazioneID,
                    "ripresa_ID": ripresaID,
                    "codiceGL": codiceGL,
                    "fileName": this.getView().byId("fileUploader").getValue()                   
                });
                
                var that = this;

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/computation/AllegatiRipresa"),
                    contentType: "application/json",
                    type: 'POST',
                    data: nuovoAllegato,
                    async: false,
                    success: function (oCompleteEntry) {
                        sap.m.MessageToast.show("Success");
                        console.log(oCompleteEntry);
                        var data = oCompleteEntry.ID //allegatoID
                        var allegato = nuovoAllegato;

                        that._putAllegato(data, allegato);
                        
                        // var id = oCompleteEntry
                        // that._handleUploadPress(id)
                        
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                    });
                
                

            },

            onNewAllegatoPress: function(){
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

            onCloseConfigurazione: function (oEvent) {
                this.byId("DialogSalva").close();
            },

            _handleUploadPress: function(id) {
                var oFileUploader = this.byId("fileUploader");
                oFileUploader.checkFileReadable().then(function() {
                    oFileUploader.setUploadUrl("/computation/AllegatiRipresa/"+id+"/content")
                    oFileUploader.setHttpRequestMethod("PUT")
                    oFileUploader.upload();
                }, function(error) {
                    MessageToast.show("The file cannot be read. It may have changed.");
                }).then(function() {
                    oFileUploader.clear();
                });
            },           

            _putAllegato: function(data, nuovoAllegato){
                var that = this;
                var allegatoID = data;
                var allegato = nuovoAllegato

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/computation/AllegatiRipresa/"+allegatoID+"/content"),
                    contentType: "application/json",
                    type: 'PUT',
                    dataType: "json",
                    data: allegato,
                    async: false,
                    success: function (oCompleteEntry) {
                        sap.m.MessageToast.show("Success");
                        debugger;
                        // var id = oCompleteEntry
                        // that._handleUploadPress(id)
                    },
                    error: function (error) {
                        debugger;
                        sap.m.MessageToast.show("Error");
                    }
                    });  
            },

            _linkAllegati: function(oEvent){
                var allegatoID = oEvent.getSource().getBindingContext("oModelTableAllegati").getObject().ID;
                //var that = this;

                var url = jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/Computation/AllegatiRipresa/"+allegatoID+"/content ");
                // Require the URLHelper and open the URL in a new window or tab (same as _blank):
                URLHelper.redirect(url, true);

               
                // jQuery.ajax({
                //     url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/Computation/AllegatiRipresa/"+allegatoID+"/content "),
                //     contentType: "application/json",
                //     type: 'GET',
                //     dataType: "json",
                //     async: false,
                //     success: function (oCompleteEntry) {
                //         debugger;
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
            }

            // openUrl: function(url, newTab) {
            //     var path = oEvent.getParameters().id.slice(94)
            //     var allegatoID = this.getView().getModel("oModelTableAllegati").oData.oModel[path].ID

            //     var url = jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/Computation/AllegatiRipresa/"+allegatoID+"/content ");
            //     // Require the URLHelper and open the URL in a new window or tab (same as _blank):
            //     URLHelper.redirect(url, newTab);

            //   },

            
        });
    });
