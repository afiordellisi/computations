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

            var oModelIrap = [
              {
                descrizione: this.getResourceBundle().getText("ricavi"),
                raggruppamento: "A1",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("rimanenze"),
                raggruppamento: "A2",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("lavori"),
                raggruppamento: "A3",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("incrementoImm"),
                raggruppamento: "A4",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("otherRicavi"),
                raggruppamento: "A5",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("totPos"),
                raggruppamento: null,
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
            ];
            var oModelIrap2 = [
              {
                descrizione: this.getResourceBundle().getText("matPrime"),
                raggruppamento: "B6",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("servizi"),
                raggruppamento: "B7",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("godBeniTerzi"),
                raggruppamento: "B8",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("ammImm"),
                raggruppamento: "B10a",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("ammMat"),
                raggruppamento: "B10b",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("varRimanenze"),
                raggruppamento: "B11",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("oneriGestione"),
                raggruppamento: "B14",
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
              {
                descrizione: this.getResourceBundle().getText("totNeg"),
                raggruppamento: null,
                valore: "",
                imposta: this.getView().byId("impostaButton").getSelectedKey(),
              },
            ];
            this.getView().setModel(
              new JSONModel({
                oModelIrap,
              }),
              "oModelTableIRAP"
            );

            this.getView().setModel(
              new JSONModel({
                oModelIrap2,
              }),
              "oModelTableIRAP2"
            );
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
              confRegions: this.getView().getModel("oModelInfoComputazione")
                .oData.confRegions,
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
                    PAImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelPD: PD.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    PDImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelTA: TA.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    TAImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelTD: TD.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    TDImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelPER: PER.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    PERImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelACE: ACE.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    ACEImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelPDIRAP: PDIRAP.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    PDIRAPImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelVPL: VPL.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    VPLImpostaSingola: (arr.imponibile * percentuale) / 100,
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
            },
            error: function (error) {
              sap.m.MessageToast.show("Error");
            },
          });

          this._setTitle();
        },

        listaFunzionalita: function (oEvent) {
          var key = oEvent.getSource().getProperty("key");
          var oRouter = this.getOwnerComponent().getRouter();

          if (key === "C04") {
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
                .getData().oModel[0].imponibile;
              var data = {
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
                PAImposta: (PAImponibile.imponibile * percentuale) / 100,
                PDImposta: (PDImponibile.imponibile * percentuale) / 100,
                TAImposta: (TAImponibile.imponibile * percentuale) / 100,
                TDImposta: (TDImponibile.imponibile * percentuale) / 100,
                PERImposta:
                  (PAImponibile.imponibile * percentuale) / 100 +
                  (PDImponibile.imponibile * percentuale) / 100 +
                  (TAImponibile.imponibile * percentuale) / 100 +
                  (TDImponibile.imponibile * percentuale) / 100,
                ACEImposta:
                  (PAImponibile.imponibile * percentuale) / 100 +
                  (PDImponibile.imponibile * percentuale) / 100 +
                  (TAImponibile.imponibile * percentuale) / 100 +
                  (TDImponibile.imponibile * percentuale) / 100 +
                  impostaPER,
                VPLImposta: impostaPER + (produzione * percentuale) / 100,
                VPNImposta: (VPN.imponibile * percentuale) / 100,
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
                    PAImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelPD: PD.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    PDImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelTA: TA.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    TAImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelTD: TD.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    TDImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelPER: PER.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    PERImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelACE: ACE.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    ACEImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelPDIRAP: PDIRAP.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    PDIRAPImpostaSingola: (arr.imponibile * percentuale) / 100,
                  };
                }),
                oModelVPL: VPL.map((arr) => {
                  return {
                    codiceRipresa: arr.codiceRipresa,
                    descrizioneRipresa: arr.descrizioneRipresa,
                    imponibile: arr.imponibile,
                    VPLImpostaSingola: (arr.imponibile * percentuale) / 100,
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
