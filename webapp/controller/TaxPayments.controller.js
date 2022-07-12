sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Fragment',
    "sap/ui/core/routing/History",
    './BaseController',
    "sap/m/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, JSONModel, Fragment, History, BaseController, mobileLibrary, MessageBox, MessageToast) {
        "use strict";
        var computazioneID;
        var URLHelper = mobileLibrary.URLHelper;
        var file;
        var tipo;
        var sText;
        var IDinserimento;

        return BaseController.extend("tax.provisioning.computations.controller.TaxPayments", {
            onInit: function () {
                this.oModel = this.getOwnerComponent().getModel();
                this.getOwnerComponent().getRouter().getRoute("TaxPayments").attachPatternMatched(this._onObjectMatched, this);

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;

                this.oView = this.getView();

                sap.ui.getCore().sapAppID = this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id;
                //this._setTestataAllegati();
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
                        var arr = oCompleteEntry.value;
                      //  var compConfronto = oCompleteEntry.value
                        var V = arr.filter(versamento => versamento.tipologia === 'V');
                        var C = arr.filter(versamento => versamento.tipologia === 'C');
                        var A = arr.filter(versamento => versamento.tipologia === 'A');
                        var O = arr.filter(versamento => versamento.tipologia === 'O');
                        var PYA = arr.filter(versamento => versamento.tipologia === 'PYA');
                        O = [].concat(O,PYA)
                        var AM = arr.filter(versamento => versamento.tipologia === 'AM');
                        var AS = arr.filter(versamento => versamento.tipologia === 'AS');
                        if(AM.length == 0){
                            AM = [{descrizione : that.getResourceBundle().getText("altriMov"), importo : null, note : "" }]
                        }
                        if(AS.length == 0){
                            AS = [{descrizione : that.getResourceBundle().getText("accontoSaldo"), importo : null, note : "" }]
                        }
                        if(O.length == 0){ //implementare il recupero della riga salvata
                            O = [{ID : "", descrizione : that.getResourceBundle().getText("credDeb"), importo : null, note : '' , allegato: ""},
                            {ID : "", descrizione : that.getResourceBundle().getText("adj"), importo : null, note : '' , allegato: ""},
                            {ID : "", descrizione : that.getResourceBundle().getText("otherVariation"), importo : null, note : '' , allegato: ""},
                            {ID : "", descrizione : that.getResourceBundle().getText("UNICOLY"), importo : null, note : '' , allegato: ""}]
                        }else {
                            O = [{ID : "", descrizione : that.getResourceBundle().getText("credDeb"), importo : null, note : '' , allegato: ""},
                            {ID : O[1].ID, descrizione : that.getResourceBundle().getText("adj"), importo : O[1].importo, note : O[1].note , allegato: O[1].fileName},
                            {ID : O[0].ID, descrizione : O[0].descrizione, importo : O[0].importo, note : O[0].note, allegato: O[0].fileName},
                            {ID :"", descrizione : that.getResourceBundle().getText("UNICOLY"), importo : null, note : '' , allegato: ""}]
                        }
                        var data = {
                            oModelV: V, //versamenti
                            oModelC: C, //compensazioni
                            oModelA: A, //acconti
                            oModelO: O, //other adjustment (atre variazioni)
                            oModelAM : AM, //altri movimenti
                            oModelAS: AS //acconti saldo
                        };
                        var oModel = new JSONModel(data);
                        that.getView().setModel(oModel, "oModelTableAllegati");
                        that._setTotaliPayments(computazioneID);
                        that.setCreditoRisLastFY(compConfronto,imposta);
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
            },

            _setTotaliPayments: function(computazioneID){
                var that = this;
                // var descrizioneGL = descrizioneGL;
                var computazioneID = computazioneID;
                var imposta = this.getView().getModel("routingModel").getData().imposta;
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPaymentsView(imposta='"+imposta+"',computationId="+computazioneID+")/Set"),
                    //url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments?$apply=filter(computation_ID eq " + computazioneID + " and imposta eq '"+imposta+"')/groupby((tipologia),aggregate(importo with sum as Importo))"),
                    contentType: "application/json",
                    type: 'GET',
                    dataType: "json",
                    async: false,
                    success: function (oCompleteEntry) {
                        var totale = oCompleteEntry.value;
                        var V = totale.filter(importo => importo.tipologia === 'V');
                        var C = totale.filter(importo => importo.tipologia === 'C');
                        var A = totale.filter(importo => importo.tipologia === 'A');
                        var O = totale.filter(importo => importo.tipologia === 'O');
                        var AM = totale.filter(importo => importo.tipologia === 'AM');
                        var tot = Math.max(V[0].creditoDebitoResiduo,C[0].creditoDebitoResiduo,AM[0].creditoDebitoResiduo,O[0].creditoDebitoResiduo ) ;
                        // if(V.length >0){
                        //     tot += V[0].Importo;
                        // }
                        // if (C.length >0){
                        //         tot += C[0].Importo;   
                        // }
                        // if(O.length >0){
                        //     tot += O[0].Importo;
                        // }
                        var totArray = [{"creditoDebitoResiduo" : tot }]; 
                        totArray.Importo = tot;
                        var data = {
                            oModelVTot: V[0],
                            oModelCTot: C[0],
                            oModelATot: A[0],
                            oModelOTot: O[0],
                            oModelTotali: totArray[0]
                        };
                        var oModelTot = new JSONModel(data);
                        that.getView().setModel(oModelTot, "oModelTableTotAllegati");
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
                        
                        that._putAllegato(ID)
                        that.onCloseNewPayment();
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

            onSaveAltro: function(){
                if (this._validazioneAllegatoAltro()) {
                var altriMovimenti;
                var fileName = this.getView().byId("fileUploaderMov").getValue();
                var that = this;

                altriMovimenti = JSON.stringify({
                    "computation_ID": computazioneID,
                    "imposta": this.getView().getModel("routingModel").getData().imposta,
                    "descrizione": sText,
                    "importo": parseFloat(this.getView().byId("importoMov").getValue()),
                    "note": this.getView().byId("notaMov").getValue(),
                    "fileName": fileName,
                    "tipologia": tipo
                });

                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments"),
                    contentType: "application/json",
                    type: 'POST',
                    data: altriMovimenti,
                    async: false,
                    success: function (oCompleteEntry) {
                        var ID = oCompleteEntry.ID //allegatoID
                        if(that.getView().byId("fileUploaderMov").getValue()){
                            that._putAllegatoAltro(ID)
                        }

                        that.onCloseAltro();
                    },
                    error: function (error) {
                        sap.m.MessageToast.show("Error");
                    }
                });
                
            }
                // }else{
                //     sap.m.MessageToast.show("Valorizzare i campi");
                //     this.getView().byId("descrizioneAllegato").setValueState("Error");
                //     this.getView().byId("importoAllegato").setValueState("Error");
                //     this.getView().byId("note").setValueState("Error");
                // }  
            },

            onSaveUpdateAltro: function(oEvent){
                if (this._validazioneAllegatoUpdate()) {
                    if(tipo=='O'){
                        var altriMovimenti;
                        var fileName = this.getView().byId("fileUploaderMovUpdate").getValue();
                        var that = this;
        
                        altriMovimenti = JSON.stringify({
                            "computation_ID": computazioneID,
                            "imposta": this.getView().getModel("routingModel").getData().imposta,
                            "descrizione": sText,
                            "importo": parseFloat(this.getView().byId("importoMovUpdate").getValue()),
                            "note": this.getView().byId("notaMovUpdate").getValue(),
                            "fileName": fileName,
                            "tipologia": tipo
                        });
        
                        jQuery.ajax({
                            url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments("+IDinserimento+")"),
                            contentType: "application/json",
                            type: 'PUT',
                            data: altriMovimenti,
                            async: false,
                            success: function (oCompleteEntry) {
                                var ID = oCompleteEntry.ID //allegatoID
                                IDinserimento = undefined;
                                that.onCloseUpdateAltro();
                            },
                            error: function (error) {
                                sap.m.MessageToast.show("Error");
                            }
                        });                        
                    }if(tipo==='PYA'){
                        if(IDinserimento === undefined){
                            var PYA;
                            var that = this;
            
                            PYA = JSON.stringify({
                                "computation_ID": computazioneID,
                                "imposta": this.getView().getModel("routingModel").getData().imposta,
                                "descrizione": sText,
                                "importo": parseFloat(this.getView().byId("importoMovUpdate").getValue()),
                                "note": this.getView().byId("notaMovUpdate").getValue(),
                                "fileName": fileName,
                                "tipologia": tipo
                            });
            
                            jQuery.ajax({
                                url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments"),
                                contentType: "application/json",
                                type: 'POST',
                                data: PYA,
                                async: false,
                                success: function (oCompleteEntry) {
                                    var ID = oCompleteEntry.ID //allegatoID
                                    if(that.getView().byId("fileUploaderMovUpdate").getValue()){
                                        that._putAllegatoAltro(ID)
                                    }
                                    IDinserimento = undefined;
                                    that.onCloseUpdateAltro();
                                },
                                error: function (error) {
                                    sap.m.MessageToast.show("Error");
                                }
                            });          
                        }else{
                            var altriMovimenti;
                            var fileName = this.getView().byId("fileUploaderMovUpdate").getValue();
                            var that = this;
            
                            altriMovimenti = JSON.stringify({
                                "computation_ID": computazioneID,
                                "imposta": this.getView().getModel("routingModel").getData().imposta,
                                "descrizione": sText,
                                "importo": parseFloat(this.getView().byId("importoMovUpdate").getValue()),
                                "note": this.getView().byId("notaMovUpdate").getValue(),
                                "fileName": fileName,
                                "tipologia": tipo
                            });
            
                            jQuery.ajax({
                                url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments("+IDinserimento+")"),
                                contentType: "application/json",
                                type: 'PUT',
                                data: altriMovimenti,
                                async: false,
                                success: function (oCompleteEntry) {
                                    var ID = oCompleteEntry.ID //allegatoID
                                    that.onCloseUpdateAltro();
                                },
                                error: function (error) {
                                    sap.m.MessageToast.show("Error");
                                }
                            });                                      
                        }   
                    }
                   if(tipo === 'V' || tipo === 'C' || tipo === 'A'){
                    var inserimento;
                    var fileName = this.getView().byId("fileUploaderMovUpdate").getValue();
                    var that = this;
    
                    inserimento = JSON.stringify({
                        "computation_ID": computazioneID,
                        "imposta": this.getView().getModel("routingModel").getData().imposta,
                        "descrizione": sText,
                        "importo": parseFloat(this.getView().byId("importoMovUpdate").getValue()),
                        "note": this.getView().byId("notaMovUpdate").getValue(),
                        "fileName": fileName,
                        "tipologia": tipo
                    });
    
                    jQuery.ajax({
                        url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments("+IDinserimento+")"),
                        contentType: "application/json",
                        type: 'PUT',
                        data: inserimento,
                        async: false,
                        success: function (oCompleteEntry) {
                            var ID = oCompleteEntry.ID //allegatoID
                            that.onCloseUpdateAltro();
                        },
                        error: function (error) {
                            sap.m.MessageToast.show("Error");
                        }
                    }); 
                   }
                if(tipo === 'AM' || tipo === 'AS'){
                    var inserimento;
                    var fileName = this.getView().byId("fileUploaderMovUpdate").getValue();
                    var that = this;
    
                    inserimento = JSON.stringify({
                        "computation_ID": computazioneID,
                        "imposta": this.getView().getModel("routingModel").getData().imposta,
                        "descrizione": sText,
                        "importo": parseFloat(this.getView().byId("importoMovUpdate").getValue()),
                        "note": this.getView().byId("notaMovUpdate").getValue(),
                        "fileName": fileName,
                        "tipologia": tipo
                    });
    
                    jQuery.ajax({
                        url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments("+IDinserimento+")"),
                        contentType: "application/json",
                        type: 'PUT',
                        data: inserimento,
                        async: false,
                        success: function (oCompleteEntry) {
                            var ID = oCompleteEntry.ID //allegatoID
                            that.onCloseUpdateAltro();
                        },
                        error: function (error) {
                            sap.m.MessageToast.show("Error");
                        }
                    });           
                }
                }
                    else{
                        sap.m.MessageToast.show("Valorizzare i campi");
                        this.getView().byId("descrizioneMovUpdate").setValueState("Error");
                        this.getView().byId("importoMovUpdate").setValueState("Error");
                        this.getView().byId("notaMovUpdate").setValueState("Error");
                    } 
            },            

            onAdd: function(oEvent){
                var year = [];
                var currentYear = new Date().getFullYear();
                var data = {
                    "items": [
                        {
                            "key" : "",
                            "year" : currentYear
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 1                            
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 2                            
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 3                            
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 4                            
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 5                           
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 6                            
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 7                            
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 8                            
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 9                            
                        },
                        {
                            "key" : "",
                            "year" : currentYear - 10                            
                        }
                    ]

                } 
                this.getView().setModel(
                    new JSONModel({
                          data
                    }),
                    "YearModel"
                  );
                
                var sId = oEvent.getSource().getId();
                if(sId.includes("addAcconto")){
                    tipo = 'A';
                }
                if(sId.includes("addVersamento")){
                    tipo = 'V';
                }
                if(sId.includes("addCompensazione")){
                    tipo = 'C';
                }
               
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

            onEdit: function(oEvent){
                var sId = oEvent.getSource().getId();
                if(sId.includes("addAltroMovimento")){
                    sText = this.getResourceBundle().getText("altriMov")
                    tipo = 'AM'
                }if(sId.includes("addCredito")){
                    sText = this.getResourceBundle().getText("otherVariation")
                    tipo = 'O'
                }if(sId.includes("addAccontoSaldo")){
                    sText = this.getResourceBundle().getText("accontoSaldo")
                    tipo = 'AS'
                }
                var that = this;
                var oView = this.getView();
                if (!this._pDialogConf2) {
                    this._pDialogConf2 = Fragment.load({
                        id: oView.getId(),
                        name: "tax.provisioning.computations.view.fragment.AltriMovimenti",
                        controller: this
                    }).then(function (oDialogConf2) {
                        that.byId("descrizioneMov").setText(sText)
                        oView.addDependent(oDialogConf2);
                        return oDialogConf2;
                    });
                }
                this._pDialogConf2.then(function (oDialogConf2) {
                    //this._configDialog(oButton, oDialogConf);
                    that.byId("descrizioneMov").setText(sText)
                    oDialogConf2.open();
                });
            },

            onEditInserimento: function(oEvent){
                var oItem = oEvent.getSource().getBindingContext("oModelTableAllegati").getObject();
                if(oItem.descrizione === 'Prior Year Adjustments'){
                    tipo = 'PYA'
                    sText = this.getResourceBundle().getText("adj")
                    IDinserimento = oItem.ID;
                }if(oItem.descrizione === 'Altri movimenti credito (debito)'){
                    tipo = 'AM'
                    sText = this.getResourceBundle().getText("altriMov")
                    IDinserimento = oItem.ID;
                }if(oItem.descrizione === 'Acconti versati - saldo a bilancio'){
                    tipo = 'AS'
                    sText = this.getResourceBundle().getText("accontoSaldo")
                    IDinserimento = oItem.ID;
                }if(oItem.descrizione === 'Altre variazioni'){
                    sText = this.getResourceBundle().getText("otherVariation")
                    tipo = 'O'
                    IDinserimento = oItem.ID;
                }if(oItem.tipologia === 'V'){
                    sText = oItem.descrizione;
                    tipo = 'V'
                    IDinserimento = oItem.ID;
                }if(oItem.tipologia === 'C'){
                    sText = oItem.descrizione;
                    tipo = 'C'
                    IDinserimento = oItem.ID;
                }if(oItem.tipologia === 'A'){
                    sText = oItem.descrizione;
                    tipo = 'A'
                    IDinserimento = oItem.ID;
                }
                var that = this;
                var oView = this.getView();
                if (!this._pDialogConf3) {
                    this._pDialogConf3 = Fragment.load({
                        id: oView.getId(),
                        name: "tax.provisioning.computations.view.fragment.updateMovimenti",
                        controller: this
                    }).then(function (oDialogConf3) {
                        that.byId("descrizioneMovUpdate").setText(sText)
                        that.byId("importoMovUpdate").setValue(oItem.importo)
                        that.byId("notaMovUpdate").setValue(oItem.note)
                        //l'allegato come lo gestiamo? va recuperato quello presente? o lo lasciamo vuoto?
                        oView.addDependent(oDialogConf3);
                        return oDialogConf3;
                    });
                }
                this._pDialogConf3.then(function (oDialogConf3) {
                    //this._configDialog(oButton, oDialogConf);
                    that.byId("descrizioneMovUpdate").setText(sText)
                    that.byId("importoMovUpdate").setValue(oItem.importo)
                    that.byId("notaMovUpdate").setValue(oItem.note)
                    oDialogConf3.open();
                });
            },

            onCloseAltro:function(){
                var imposta = this.getView().getModel("routingModel").getData().imposta;
                this.byId("DialogAltriMov").close();
                this.byId("fileUploaderMov").clear();
                this.byId("notaMov").setValue("");
                //this.byId("descrizioneAllegato").setValue("");
                this.byId("importoMov").setValue("");
                this._setTableAllegati(computazioneID, imposta)
            },

            onCloseUpdateAltro: function(){
                var imposta = this.getView().getModel("routingModel").getData().imposta;
                this.byId("DialogUpdateAltriMov").close();
                this.byId("fileUploaderMovUpdate").clear();
                this.byId("notaMovUpdate").setValue("");
                this.byId("importoMovUpdate").setValue("");
                this._setTableAllegati(computazioneID, imposta)
            },

            onCloseNewPayment: function (oEvent) {
                    var imposta = this.getView().getModel("routingModel").getData().imposta;
                    this.byId("DialogSalva").close();
                    this.byId("fileUploader").clear();
                    this.byId("descrizioneAllegato").setValue("");
                    this.byId("importoAllegato").setValue("");
                    this._setTableAllegati(computazioneID, imposta)
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

            onNotePress: function(oEvent){
                var oItem = oEvent.getSource().getBindingContext("oModelTableAllegati").getObject();
                var message = oItem.note;
                
                MessageBox.information(message, {
                    title: "Note", 
                    styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
                });
            },

            _putAllegato: function (ID, nuovoAllegato) {
                var that = this;
                var allegatoID = ID;
                var allegato = nuovoAllegato
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments/" + allegatoID + "/content"),
                    contentType: false,
                    type: 'PUT',
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

            _putAllegatoAltro: function(ID){
                var that = this;
                var allegatoID = ID;
                jQuery.ajax({
                    url: jQuery.sap.getModulePath(sap.ui.getCore().sapAppID + "/catalog/TaxPayments/" + allegatoID + "/content"),
                    contentType: false,
                    type: 'PUT',
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
            },

            _validazioneAllegato: function(){
                var oDescriptionAllegato = this.getView().byId("descrizioneAllegato");
                var oImportoAllegato = this.getView().byId("importoAllegato");
                //var oNota = this.getView().byId("noteAllegato");
                var oFile = this.getView().byId("fileUploader");
                var oDataAllegato = this.getView().byId("dataAllegato");
                var oRataAllegato = this.getView().byId("rataAllegato");
                var oCodiceTributoAllegato = this.getView().byId("codiceTributoAllegato");
                var oAnnoAllegato = this.getView().byId("annoAllegato");
                
                oDescriptionAllegato.setValueState();
                oImportoAllegato.setValueState();
                //oNota.setValueState();
                oFile.setValueState();
                oDataAllegato.setValueState();
                oRataAllegato.setValueState();
                oCodiceTributoAllegato.setValueState();
                oAnnoAllegato.setValueState();

                if (!oDescriptionAllegato.getValue()) {
                    oDescriptionAllegato.setValueState("Error");
                }
                if (!oImportoAllegato.getValue()) {
                    oImportoAllegato.setValueState("Error");
                }
                if (!oFile.getValue()) {
                    //oNota.setValueState("Error");
                    oFile.setValueState("Error");
                }
                if (!oDataAllegato.getValue()) {
                    oDataAllegato.setValueState("Error");
                }
                if (!oRataAllegato.getValue()) {
                    oRataAllegato.setValueState("Error");
                }
                if (!oCodiceTributoAllegato.getValue()) {
                    oCodiceTributoAllegato.setValueState("Error");
                }
                if (!oAnnoAllegato.getValue()) {
                    oAnnoAllegato.setValueState("Error");
                }
                if (
                    oDescriptionAllegato.getValue() &&
                    oImportoAllegato.getValue() && oFile.getValue() && oDataAllegato.getValue() && oRataAllegato.getValue() && oCodiceTributoAllegato.getValue() && oAnnoAllegato.getValue()
                )
                    return true;
                else return false;
            }, 

            _validazioneAllegatoAltro: function(){
                var oImportoAllegato = this.getView().byId("importoMov");
                var oNota = this.getView().byId("notaMov");
                var oFile = this.getView().byId("fileUploaderMov");

                oImportoAllegato.setValueState();
                oNota.setValueState();
                oFile.setValueState();

                if (!oImportoAllegato.getValue()) {
                    oImportoAllegato.setValueState("Error");
                }
                if (!oNota.getValue() && !oFile.getValue()) {
                    oNota.setValueState("Error");
                    oFile.setValueState("Error");
                }
                if (
                    oImportoAllegato.getValue() &&
                    (oNota.getValue() || oFile.getValue())
                )
                    return true;
                else return false;
            },

            _validazioneAllegatoUpdate: function(){
                var oImportoAllegato = this.getView().byId("importoMovUpdate");
                var oNota = this.getView().byId("notaMovUpdate");
                var oFile = this.getView().byId("fileUploaderMovUpdate");

                oImportoAllegato.setValueState();
                oNota.setValueState();
                oFile.setValueState();

                if (!oImportoAllegato.getValue()) {
                    oImportoAllegato.setValueState("Error");
                }
                if (!oNota.getValue() && !oFile.getValue()) {
                    oNota.setValueState("Error");
                    oFile.setValueState("Error");
                }
                if (
                    oImportoAllegato.getValue() &&
                    (oNota.getValue() || oFile.getValue())
                )
                    return true;
                else return false;
            }
        });
    });
