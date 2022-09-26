sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/table/RowAction",
    "sap/ui/table/RowActionItem",
    "sap/ui/table/RowSettings",
    "sap/ui/core/routing/History",
    "./BaseController",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    Filter,
    Fragment,
    FilterOperator,
    JSONModel,
    RowAction,
    RowActionItem,
    RowSettings,
    History,
    BaseController
  ) {
    "use strict";
    var bConfigurazione = false;
    var societa;
    var periodo;

    return BaseController.extend(
      "tax.provisioning.computations.controller.CurrentTax",
      {
        onInit: function () {
          sap.ui.getCore().sapAppID = this.getOwnerComponent()
            .getMetadata()
            .getManifest()["sap.app"].id;

          this.oModel = this.getOwnerComponent().getModel();

          this.getOwnerComponent()
            .getRouter()
            .getRoute("CurrentTax")
            .attachPatternMatched(this._onObjectMatched, this);

          this._setHeader();
          this._tableIrap();
        },

        handleActionPress: function (oEvent) {
          var codiceRipresa = oEvent
            .getSource()
            .getBindingContext("oModelAnagrafica")
            .getObject().codiceRipresa;
          if (codiceRipresa === "Z00001") {
            var oModel = oEvent
              .getSource()
              .getBindingContext("oModelAnagrafica")
              .getObject();

            this.getView().setModel(
              new JSONModel({
                oModel,
              }),
              "oModelZ00001"
            );

            var oView = this.getView();
            if (!this._pDialogRipresa) {
              this._pDialogRipresa = Fragment.load({
                id: oView.getId(),
                name:
                  "tax.provisioning.computations.view.fragment.DialogRipresa",
                controller: this,
              }).then(function (oDialogRipresa) {
                oView.addDependent(oDialogRipresa);
                return oDialogRipresa;
              });
            }
            this._pDialogRipresa.then(function (oDialogRipresa) {
              //this._configDialog(oButton, oDialogConf);
              oDialogRipresa.open();
            });
          } else {
            this.getRouter().navTo(
              "Riprese",
              {
                ripresaID: oEvent
                  .getSource()
                  .getBindingContext("oModelAnagrafica")
                  .getObject().codiceRipresa,
                ID: this.getView().getModel("computationModel").getData().ID,
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              false
            );
          }
        },

        onCloseModImporto: function () {
          this.byId("DialogModImporto").close();
        },

        onModificaImporto: function () {
          var oModello = this.getModel("oModelZ00001").getData();
          var importo = parseFloat(oModello.oModel.imponibile);
          var codiceRipresa = oModello.oModel.codiceRipresa;
          var ID = this.getView().getModel("computationModel").getData().ID;
          var imposta = this.getView().byId("impostaButton").getSelectedKey();
          var codiceGL = "2501000000";

          var nuovoImporto = JSON.stringify({
            allegati: [
              {
                computation_ID: ID,
                imposta: imposta,
                importo: importo,
                codiceGL: codiceGL,
              },
            ],
          });

          var that = this;

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/AnagraficaRiprese/" +
                codiceRipresa
            ),
            contentType: "application/json",
            type: "PATCH",
            data: nuovoImporto,
            async: false,
            success: function (oCompleteEntry) {
              sap.m.MessageToast.show("Success");
              that.onCloseModImporto();
              that.onScegliImposta();
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
              that.onCloseModImporto();
            },
          });
        },

        onNavBack: function (oEvent) {
          this.getRouter().navTo("View1");
        },

        updateTrialBalance: function (oEvent) {
          var oView = this.getView();
          this._setNewTrialBalance();
          if (!this._pDialogConf) {
            this._pDialogConf = Fragment.load({
              id: oView.getId(),
              name:
                "tax.provisioning.computations.view.fragment.NewTrialBalanceComputations",
              controller: this,
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

        onCloseNewComputation: function () {
          this.byId("DialogNewTrialBalance").close();
          this.byId("descrizioneNewComputation").setValue("");
        },

        _tableIrap: function (impostaValida) {
          if (impostaValida) {
            this.getView().byId("tableIRAP2").setVisible(true);
            this.getView().byId("tableIRAP").setVisible(true);
            this.getView().byId("table1HeaderIrap").setVisible(true);
            this.getView().byId("table1").setVisible(false);

            var ID = this.getView().getModel("computationModel").getData().ID;

            var that = this;
            jQuery.ajax({
              url: jQuery.sap.getModulePath(
                sap.ui.getCore().sapAppID + "/catalog/Computations(" + ID + ")"
              ),
              contentType: "application/json",
              type: "GET",
              dataType: "json",
              async: false,
              success: function (oCompleteEntry) {
                var IDversione = oCompleteEntry.Versione_ID;
                var data = {
                  versione: IDversione,
                };
                var oDataModel = new sap.ui.model.json.JSONModel(data);
                that.setModel(oDataModel, "oModelInfoVersione");
              },
              error: function (error) {
                sap.m.MessageToast.show("Error");
              },
            });

            var IDversione = this.getView()
              .getModel("oModelInfoVersione")
              .getData().versione;

            jQuery.ajax({
              url: jQuery.sap.getModulePath(
                sap.ui.getCore().sapAppID +
                  "/catalog/raggruppamentiBilancioView(versioneId=" +
                  IDversione +
                  ")/Set"
              ),
              contentType: "application/json",
              type: "GET",
              dataType: "json",
              async: false,
              success: function (oCompleteEntry) {
                var arr = oCompleteEntry.value;
                var oModelIrap = arr.filter(
                  (tabellaA) => tabellaA.id.substring(0, 1) === "A"
                );
                var importoTotA = 0;
                for(var i = 0; i<oModelIrap.length; i++){
                    oModelIrap[i].importo = - oModelIrap[i].importo
                    importoTotA += oModelIrap[i].importo
                }
                var totaleA = {
                descrizione: that.getResourceBundle().getText("totPos"),
                id: null,
                importo: importoTotA,
                imposta: that.getView().byId("impostaButton").getSelectedKey(),
                }
                oModelIrap.push(totaleA);
                var oModelIrap2 = arr.filter(
                  (tabellaB) => tabellaB.id.substring(0, 1) === "B"
                );
                var importoTotB = 0;
                for(var i = 0; i<oModelIrap2.length; i++){
                    importoTotB += oModelIrap2[i].importo
                }
                var totaleB = {
                    descrizione: that.getResourceBundle().getText("totNeg"),
                    id: null,
                    importo: importoTotB,
                    imposta: that.getView().byId("impostaButton").getSelectedKey(),
                    }
                oModelIrap2.push(totaleB);
                var oModelIrap3 = arr.filter(
                  (tabellaC) => tabellaC.id.substring(0, 1) === "C"
                );
                var importoTotC = 0;
                for(var i = 0; i<oModelIrap3.length; i++){
                    oModelIrap3[i].importo = - oModelIrap3[i].importo
                    importoTotC += oModelIrap3[i].importo
                }
                var totaleC = {
                    descrizione: that.getResourceBundle().getText("margineInteresse"),
                    id: null,
                    importo: importoTotC,
                    imposta: that.getView().byId("impostaButton").getSelectedKey(),
                    }
                oModelIrap3.push(totaleC);

                var data1 = {
                  oModelIrap: oModelIrap,
                };
                var oDataModel = new sap.ui.model.json.JSONModel(data1);
                that.setModel(oDataModel, "oModelTableIRAP");
                var data2 = {
                  oModelIrap2: oModelIrap2,
                };
                var oDataModel = new sap.ui.model.json.JSONModel(data2);
                that.setModel(oDataModel, "oModelTableIRAP2");
                var data3 = {
                  oModelIrap3: oModelIrap3,
                };
                var oDataModel = new sap.ui.model.json.JSONModel(data3);
                that.setModel(oDataModel, "oModelTableIRAP3");

                var VLP = 0;
                VLP = totaleA.importo + totaleB.importo + totaleC.importo

                that.getView().getModel("headerModelIRAP").getData().oModel[0].imponibile = VLP
                var percentuale = parseFloat(that.getView().getModel("oModelPercentuale").getData().oModelPercentuale)
                that.getView().getModel("headerModelIRAP").getData().oModel[0].impostaPerc = parseFloat(VLP * percentuale /100)
              },
              error: function (error) {
                sap.m.MessageToast.show("Error");
              },
            });
          } else {
            this.getView().byId("tableIRAP2").setVisible(false);
            this.getView().byId("tableIRAP").setVisible(false);
            this.getView().byId("table1HeaderIrap").setVisible(false);
            this.getView().byId("table1").setVisible(true);
          }
        },

        onSaveNewComputation: function (oEvent) {
          var oTable = this.getView().byId("idNewTaxRule");
          var oSelectedItem = oTable.getSelectedItem();

          if (
            this.getView().byId("descrizioneNewComputation").getValue() &&
            oSelectedItem
          ) {
            var versioneID = oSelectedItem.getModel("oModelNewTrialBalance")
              .oData[0].ID;
            // var oPath = oTable
            //   .getSelectedItem()
            //   .getBindingContext("oModelNewTrialBaance")
            //   .getPath()
            //   .split("/")[1];

            var ID = this.getView().getModel("computationModel").getData().ID;
            var descrizione = this.byId("descrizioneNewComputation").getValue();

            var that = this;

            jQuery.ajax({
              url: jQuery.sap.getModulePath(
                sap.ui.getCore().sapAppID +
                  "/catalog/Computations(" +
                  ID +
                  ")?$expand=confRegions"
              ),
              contentType: "application/json",
              type: "GET",
              dataType: "json",
              async: false,
              success: function (oCompleteEntry) {
                sap.m.MessageToast.show("Success");
                var oData = oCompleteEntry;
                var oDataModel = new JSONModel(oData);
                that.setModel(oDataModel, "oModelInfoComputazione");
                that.onCloseNewComputation();
                that._setTotaliRiprese();
              },
              error: function (error) {
                sap.m.MessageToast.show("Error");
              },
            });

            var updateComputation = JSON.stringify({
              descrizione: descrizione,
              Configurazione_ID: this.getView().getModel(
                "oModelInfoComputazione"
              ).oData.Configurazione_ID,
              Versione_ID: versioneID,
              compConfronto: this.getView().getModel("oModelInfoComputazione")
                .oData.compConfronto,
              // confRegions: this.getView().getModel("oModelInfoComputazione")
              //      .oData.confRegions,
            });

            jQuery.ajax({
              url: jQuery.sap.getModulePath(
                sap.ui.getCore().sapAppID + "/catalog/Computations"
              ),
              contentType: "application/json",
              type: "POST",
              dataType: "json",
              data: updateComputation,
              async: false,
              success: function (oCompleteEntry) {
                var IdComputazione = oCompleteEntry.ID;

                that._copyComputation(IdComputazione);
              },
              error: function (error) {
                sap.m.MessageToast.show("Error");
              },
            });
          } else {
            sap.m.MessageToast.show(
              this.getResourceBundle().getText("campiObbligatoriLabel")
            );
          }
        },

        _copyComputation: function (IdComputazione) {
          var that = this;

          var dataID = JSON.stringify({
            source: this.getView().getModel("computationModel").getData().ID,
            target: IdComputazione,
          });

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID + "/catalog/CopyComputation"
            ),
            contentType: "application/json",
            type: "POST",
            dataType: "json",
            data: dataID,
            async: false,
            success: function (oCompleteEntry) {
              sap.m.MessageToast.show("Success");
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
            },
          });
        },

        onScegliImposta: function (oEvent) {
          this.onOpenBusyDialog();
          var that = this;
          var ID = this.getView().getModel("computationModel").getData().ID;
          //var conf = this.getView().getModel("computationModel").getData().conf;
          var imposta = this.getView().byId("impostaButton").getSelectedKey();
          var percentuale = parseFloat(
            this.getModel("oModelPercentuale").getData().oModelPercentuale
          );
          this._setHeader();
          //if(conf != "false"){
          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/TotRipresaView?$count=true&$filter=computationId eq " +
                ID +
                " and imposta eq '" +
                imposta +
                "'"
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var arr = oCompleteEntry.value;
              var PA = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "P" &&
                  codiceRipresa.tipoVariazione === "A"
              );
              var PD = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "P" &&
                  codiceRipresa.tipoVariazione === "D"
              );
              var PDIRAP = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "P" &&
                  codiceRipresa.tipoVariazione === "D" &&
                  codiceRipresa.produzione !== "S"
              );
              var VPL = arr.filter(
                (codiceRipresa) => codiceRipresa.produzione === "S"
              );
              var TA = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "T" &&
                  codiceRipresa.tipoVariazione === "A"
              );
              var TD = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "T" &&
                  codiceRipresa.tipoVariazione === "D"
              );
              var PER = arr.filter(
                (codiceRipresa) => codiceRipresa.tipoVariazione === "PER"
              );
              var ACE = arr.filter(
                (codiceRipresa) => codiceRipresa.tipoVariazione === "ACE"
              );

              var data = {
                oModelPA: PA.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelPD: PD.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelTA: TA.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelTD: TD.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelPER: PER.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelACE: ACE.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelPDIRAP: PDIRAP.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelVPL: VPL.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
              };
              var DataModel = new sap.ui.model.json.JSONModel();
              DataModel.setData(data);
              that.getView().setModel(DataModel, "oModelAnagrafica");
              that._setTotaliRiprese();
              var impostaValida;
              if (imposta === "IRAP") {
                impostaValida = true;
                that._tableIrap(impostaValida);
              } else {
                impostaValida = false;
                that._tableIrap(impostaValida);
              }
              that.onCloseBusyDialog();
            },
            error: function (error) {
              that.onCloseBusyDialog();
              sap.m.MessageToast.show("Error");
            },
          });

          this._setTitle();
        },

        listaFunzionalita: function (oEvent) {
          var key = oEvent.getSource().getProperty("key");
          var oRouter = this.getOwnerComponent().getRouter();

          if (key === "C04") {
            this.onOpenBusyDialog();
            oRouter.navTo(
              "TimeDiff",
              {
                ID: this.getView().getModel("computationModel").getData().ID,
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              false
            );
          }
          if (key === "C05") {
            this.onOpenBusyDialog();
            oRouter.navTo(
              "DTLDTA",
              {
                ID: this.getView().getModel("computationModel").getData().ID,
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              false
            );
          }
          if (key === "C06") {
            this.onOpenBusyDialog();
            oRouter.navTo(
              "TaxPayments",
              {
                ID: this.getView().getModel("computationModel").getData().ID,
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              false
            );
          }
          if (key === "C07") {
            this.onOpenBusyDialog();
            oRouter.navTo(
              "TaxLiquidation",
              {
                ID: this.getView().getModel("computationModel").getData().ID,
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              false
            );
          }
          this.getView().byId("navigationList");
        },

        _setTotaliRiprese: function () {
          var ID = this.getView().getModel("computationModel").getData().ID;
          var imposta = this.getView().byId("impostaButton").getSelectedKey();

          var that = this;
          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/KPITotRipresaView?$filter=computationId eq " +
                ID +
                " and imposta eq '" +
                imposta +
                "'"
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var arr = oCompleteEntry.value[0];
              var utilePerditaCY = arr.utilePerditaAnteImposte; //valore in testata
              var PAImponibile = { imponibile: arr.imponibilePA };
              var PDImponibile = { imponibile: arr.imponibilePD };
              var TAImponibile = { imponibile: arr.imponibileTA };
              var TDImponibile = { imponibile: arr.imponibileTD };
              var PERImponibile = { imponibile: arr.imponibilePER };
              var ACEImponibile = { imponibile: arr.imponibileACE };
              var RedditoImponibile = { imponibile: arr.redditoImponibile };
              var PDIRAPImponibile = { imponibile: arr.imponibilePDIRAP };
              var VPL = { imponibile: arr.VPL };
              var VPN = { imponibile: arr.VPN };
              var percentuale = parseFloat(
                that.getModel("oModelPercentuale").getData().oModelPercentuale
              );
              var impostaPER =
                ((that.getView().getModel("oModelAnagrafica").getData()
                  .oModelPER[0].imponibile +
                  that.getView().getModel("oModelAnagrafica").getData()
                    .oModelPER[1].imponibile) *
                  percentuale) /
                100;
              var produzione = that
                .getView()
                .getModel("headerModelIRAP")
                .getData().oModel[0].imponibile; //va cambiato una volta in possesso dei valori da importare sulle tabelle
              var data = {
                oModelUtile: utilePerditaCY,
                oModelPAImponibile: PAImponibile,
                oModelPDImponibile: PDImponibile,
                oModelTAImponibile: TAImponibile,
                oModelTDImponibile: TDImponibile,
                oModelPERImponibile: PERImponibile,
                oModelACEImponibile: ACEImponibile,
                oModelRedditoImponibile: RedditoImponibile,
                oModelPDIRAPImponibile: PDIRAPImponibile,
                oModelVPLImponibile: VPL,
                oModelVPNImponibile: VPN,
                PAImposta: arr.impostaPA,
                // (PAImponibile.imponibile * percentuale) / 100,
                PDImposta: arr.impostaPD,
                //(PDImponibile.imponibile * percentuale) / 100,
                PDIRAPImposta: arr.impostaPDIRAP,
                //(PDIRAPImponibile.imponibile * percentuale) / 100,
                TAImposta: arr.impostaTA,
                //(TAImponibile.imponibile * percentuale) / 100,
                TDImposta: arr.impostaTD,
                //(TDImponibile.imponibile * percentuale) / 100,
                PERImposta: arr.impostaPER,
                //   (PAImponibile.imponibile * percentuale) / 100 +
                //   (PDImponibile.imponibile * percentuale) / 100 +
                //   (TAImponibile.imponibile * percentuale) / 100 +
                //   (TDImponibile.imponibile * percentuale) / 100,
                ACEImposta: arr.impostaACE,
                //   (PAImponibile.imponibile * percentuale) / 100 +
                //   (PDImponibile.imponibile * percentuale) / 100 +
                //   (TAImponibile.imponibile * percentuale) / 100 +
                //   (TDImponibile.imponibile * percentuale) / 100 +
                //   impostaPER,
                VPLImposta: impostaPER + (produzione * percentuale) / 100,
                VPNImposta: (VPN.imponibile * percentuale) / 100,
                impostaRedditoImponibile: arr.impostaRedditoImponibile,
                PAcorrenti: arr.correntiPA,
                PDcorrenti: arr.correntiPD,
                TAcorrenti: arr.correntiTA,
                TDcorrenti: arr.correntiTD,
                PDIRAPcorrenti: arr.correntiPDIRAP,
                PERcorrenti: arr.correntiPER,
                correntiTestata: arr.correntiTestata,
                PAdifferite: arr.differitePA,
                PDdifferite: arr.differitePD,
                PDIRAPdifferite: arr.differitePDIRAP,
                PERdifferite: arr.differitePER,
                TAdifferite: arr.differiteTA,
                TDdifferite: arr.differiteTD,
                differiteTestata: arr.differiteTestata,
                totalePA: arr.totalePA,
                totalePD: arr.totalePD,
                totalePDIRAP: arr.totalePDIRAP,
                totalePER: arr.totalePER,
                totaleTA: arr.totaleTA,
                totaleTD: arr.totaleTD,
                totaleTestata: arr.totaleTestata,
              };
              var DataModel = new sap.ui.model.json.JSONModel();
              DataModel.setData(data);
              that.getView().setModel(DataModel, "oModelTotali");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _onObjectMatched: function (oEvent) {
          this.onCloseBusyDialog();
          var oEvent = oEvent.getParameter("arguments");
          this._setHeader();
          var ID = oEvent.ID; //ID computazione
          //var conf = oEvent.conf;

          this.getView().setModel(
            new JSONModel({
              ID: ID, //ID computazione
              // "conf": conf
            }),
            "computationModel"
          );
          this._setPercentuale();

          var imposta = this.getView().byId("impostaButton").getSelectedKey();
          var percentuale = parseFloat(
            this.getModel("oModelPercentuale").getData().oModelPercentuale
          );
          var that = this;
          //if(conf != "false"){
          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/TotRipresaView?$count=true&$filter=computationId eq " +
                ID +
                " and imposta eq '" +
                imposta +
                "'"
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var arr = oCompleteEntry.value;
              var PA = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "P" &&
                  codiceRipresa.tipoVariazione === "A"
              );
              var PD = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "P" &&
                  codiceRipresa.tipoVariazione === "D"
              );
              var PDIRAP = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "P" &&
                  codiceRipresa.tipoVariazione === "D" &&
                  codiceRipresa.produzione !== "S"
              );
              var VPL = arr.filter(
                (codiceRipresa) => codiceRipresa.produzione === "S"
              );
              var TA = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "T" &&
                  codiceRipresa.tipoVariazione === "A"
              );
              var TD = arr.filter(
                (codiceRipresa) =>
                  codiceRipresa.tipologia === "T" &&
                  codiceRipresa.tipoVariazione === "D"
              );
              var PER = arr.filter(
                (codiceRipresa) => codiceRipresa.tipoVariazione === "PER"
              );
              var ACE = arr.filter(
                (codiceRipresa) => codiceRipresa.tipoVariazione === "ACE"
              );

              var data = {
                oModelPA: PA.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelPD: PD.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelTA: TA.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelTD: TD.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelPER: PER.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelACE: ACE.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelPDIRAP: PDIRAP.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
                oModelVPL: VPL.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    UNICO: arr.UNICO,
                    correnti: arr.correnti,
                    currentAvg: arr.currentAvg,
                    differite: arr.differite,
                    impostaPercRipresa: arr.impostaPercRipresa,
                    produzione: arr.produzione,
                    totale: arr.totale,
                  };
                }),
              };
              var DataModel = new sap.ui.model.json.JSONModel();
              DataModel.setData(data);
              that.getView().setModel(DataModel, "oModelAnagrafica");
              that._setTotaliRiprese();
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });

          this._setTitle();
        },

        _setHeader: function () {
          this.getView().setModel(
            new JSONModel({
              oModel: [
                {
                  imponibile: 250000,
                  // "imposta": "60.000",
                  unico: "",
                  // "correnti": "60.000",
                  differite: "",
                  //"totale": "60.000",
                  impostaPerc: 24,
                  testo: "Utile perdita ante imposte",
                },
              ],
            }),
            "headerModel"
          );

          this.getView().setModel(
            new JSONModel({
              oModel: [
                {
                  imponibile: 250000,
                  // "imposta": "60.000",
                  unico: "",
                  // "correnti": "60.000",
                  differite: "",
                  //"totale": "60.000",
                  impostaPerc: 24,
                  testo: "Valore della produzione lorda rettificato",
                },
              ],
            }),
            "headerModelIRAP"
          );

          this.getView().setModel(
            new JSONModel({
              imposta: this.getView().byId("impostaButton").getSelectedKey(),
            }),
            "oModelImposta"
          );
        },

        _setTitle: function () {
          var that = this;
          var ID = this.getView().getModel("computationModel").getData().ID;
          var percentuale = parseFloat(
            this.getModel("oModelPercentuale").getData().oModelPercentuale
          );
          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/Computations?$expand=Versione&$filter=ID eq " +
                ID +
                ""
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var data = {
                oModelDescrizione: oCompleteEntry.value[0],
                oModelParamentri: oCompleteEntry.value[0].Versione,
                oModelImpostaHeader:
                  (oCompleteEntry.value[0].Versione.utilePerditaCY *
                    percentuale) /
                  100,
              };
              var DataModel = new sap.ui.model.json.JSONModel();
              DataModel.setData(data);
              that.getView().setModel(DataModel, "oModelDescrizione");
              that._setPercentuale();
              (societa = data.oModelParamentri.societa),
                (periodo = data.oModelParamentri.periodo);
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setPercentuale: function () {
          var that = this;
          //var ID = this.getView().getModel("computationModel").getData().ID;
          //   var configurazioneID = this.getView()
          //     .getModel("oModelDescrizione")
          //     .getData().oModelConfigurazioneID;
          var computazioneID = this.getView()
            .getModel("computationModel")
            .getData().ID;
          var imposta = this.getView().byId("impostaButton").getSelectedKey();

          //   var fUtilePerditaCY = this.getModel("oModelDescrizione").getData()
          //     .oModelParamentri.utilePerditaCY;
          //   var fPAImponibile = this.getModel("oModelTotali").getData()
          //     .oModelPAImponibile.imponibile;

          //   var fPAImponibileSingolo = this.getModel("oModelAnagrafica").getData()
          //     .oModelPA;

          //var conf = this.getView().getModel("computationModel").getData().conf;

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/RegionsAVGView?$filter=computazioneID eq " +
                computazioneID +
                " and imposta eq '" +
                imposta +
                "'"
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var data = {
                oModelPercentuale: oCompleteEntry.value[0].currentAvg,
                // utilePerditaCY:
                //   (fUtilePerditaCY * oCompleteEntry.value[0].currentAvg) / 100,
                // PAImposta:
                //   (fPAImponibile * oCompleteEntry.value[0].currentAvg) / 100,
                //  PAImpostaSingola: fPAImponibileSingolo.map(imponibile => imponibile * parseFloat(oCompleteEntry.value[0].currentAvg) / 100 )
              };
              var DataModel = new sap.ui.model.json.JSONModel();
              DataModel.setData(data);
              that.getView().setModel(DataModel, "oModelPercentuale");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },

        _setNewTrialBalance: function () {
          var that = this;

          jQuery.ajax({
            url: jQuery.sap.getModulePath(
              sap.ui.getCore().sapAppID +
                "/catalog/Versioni?$filter=societa eq '" +
                societa +
                "' and periodo eq '" +
                periodo +
                "'"
            ),
            contentType: "application/json",
            type: "GET",
            dataType: "json",
            async: false,
            success: function (oCompleteEntry) {
              var oData = oCompleteEntry.value;
              var oDataModel = new JSONModel(oData);
              that.setModel(oDataModel, "oModelNewTrialBalance");
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });
        },
      }
    );
  }
);
