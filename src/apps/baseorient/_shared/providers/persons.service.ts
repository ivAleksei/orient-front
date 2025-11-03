import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { HttpService } from 'src/_shared/services/http.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonsService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private loadingService: LoadingService,
    private http: HttpService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }

  trigger() {
    this._watch.next(true);
  }

  setArquivo(args) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation setArquivo($_militar: ID, $tipo:String, $arquivo: FileInput){
        setArquivo(_militar: $_militar, tipo:$tipo, arquivo: $arquivo){
          status
        }
      }`,
      name: "setArquivo",
      variables: args
    });
  }

  setRole(args) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation setRole($_militar: ID, $_roles:[String]){
        setRole(_militar: $_militar, _roles:$_roles){
          status
        }
      }`,
      name: "setRole",
      variables: args
    });
  }

  getMilitares(args) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query militares($active: Boolean, $forca_id: String, $lotacao: String){
        militares(active: $active, forca_id: $forca_id, lotacao: $lotacao){
          _id
          str_matricula
          str_cpf
          pessoa{
            str_nome
          }
          str_nomecurto
        }
      }`,
      name: "militares",
      variables: args || {}
    });
  }

  async getMilitaresCBMRN(args?) {
    let last_get = await sessionStorage.getItem('last_militares_get');
    let data = await sessionStorage.getItem('militares');
    if (data) data = JSON.parse(data) || [];

    if ((!last_get || moment().diff(moment(last_get), 'minutes') > 60) || !data?.length) {

      if (!data?.length)
        this.loadingService.show();

      data = await this.graphql.query(environment.API.url, 'graphql', {
        query: `
        query MilitarEfetivo{
          MilitarEfetivo{
            _id
            forca_id
            str_nomecurto
            str_matricula
            index
            _patente
            militar_img
            lotacao{
              N1
              N2
              N3
            }
            pessoa{
              str_nome
              str_telefonecelular
            }
          }
        }`,
        name: "MilitarEfetivo",
        variables: args || {}
      });
      await sessionStorage.setItem('last_militares_get', moment().format())
      await sessionStorage.setItem('militares', JSON.stringify(data || []))
    }
    this.loadingService.hide();
    return data || [];
  }

  getMilitaresInfo(args, fields) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query militares($active: Boolean, $forca_id: String, $lotacao: String){
        militares(active: $active, forca_id: $forca_id, lotacao: $lotacao){
          ${fields}
        }
      }`,
      name: "militares",
      variables: args || {}
    });
  }

  getMilitaresElevacao(args) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query MilitarElevacaoNivel(
        $str_mes: String
        $str_nome: String
        $docs: String
        $_patente: String
        $status: String
      ){
        MilitarElevacaoNivel(
          str_mes: $str_mes
          str_nome: $str_nome,
          docs: $docs,
          _patente: $_patente,
          status: $status,
        ){
          _id
          str_matricula
          str_nomecurto
          dt_incorporacao
        }
      }`,
      name: "MilitarElevacaoNivel",
      variables: args
    });
  }

  getMilitarInfo(args, fields) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query militar($_id: ID, $str_matricula: String, $str_cpf: String){
        militar(_id: $_id, str_matricula: $str_matricula, str_cpf: $str_cpf){
          _id
          ${fields}
        }
      }`,
      name: "militar",
      variables: args
    });
  }

  async getArqBiometricos(args) {
    let fields = `
        str_nomecurto
        militar_img
        sign_img
        thumb_img
        hist_militar_img
        hist_sign_img
        hist_thumb_img
    `;
    let data = await this.getMilitarInfo(args, fields);
    let obj;
    try {
      let parseFile = k => {
        return {
          exp_at: k,
          name: obj[k].split('/').slice(-1),
          url: obj[k]
        }
      };
      obj = JSON.parse(data.hist_militar_img || "{}");
      data.hist_militar_img = Object.keys(obj || {}).map(parseFile);
      obj = JSON.parse(data.hist_sign_img || "{}");
      data.hist_sign_img = Object.keys(obj || {}).map(parseFile);
      obj = JSON.parse(data.hist_thumb_img || "{}");
      data.hist_thumb_img = Object.keys(obj || {}).map(parseFile);
    } catch (err) { }

    return data;
  }

  getEscolaridadeInfo(args) {
    let fields = `
      pessoa{
        str_escolaridade
        str_escolaridade_status
      }
    `;
    return this.getMilitarInfo(args, fields);
  }

  getPersonalInfo(args) {
    let fields = `
      str_nomecurto
      pessoa{
        str_nome
        dt_nascimento
        str_sexo
        str_etnia
        naturalidade{
          cidade
          uf
        }
        filiacao_pai
        filiacao_mae
        op_religiao
        est_civil
        endereco{
          str_cep
          str_endereco
          str_numero
          str_complemento
          str_bairro
          str_cidade
          str_uf
          str_pontoreferencia
        }
        str_telefone
        str_tipo_sanguineo
        str_telefonecelular
        str_email
      }
    `;
    return this.getMilitarInfo(args, fields);
  }

  getFuncionalInfo(args) {
    let fields = `
    index
    _patente
    _quadro
    str_nomecurto
    str_nomeguerra
    forca_id
    n_praca
    str_rg_militar
    militar_img
    lotacao{
      N1
      N2
      N3
    }
    lotacao_bgnum
    lotacao_acontar
    atuacao
    str_matricula
    comportamento
    comportamento_acontar
    comportamento_bgnum
    dt_incorporacao
    nivel
    active
    situacao_status
    situacao_acontar
    situacao_bgnum
    situacao_vivo
    obito_data
    obito_motivo
    obito_profissao
    `;
    return this.getMilitarInfo(args, fields);
  }

  getDocsInfo(args) {
    let fields = `
    str_nomecurto
    str_cpf
    str_rg_militar

    arquivos{
      rg{
        _id
        name
        size
        url
      }
      cpf{
        _id
        name
        size
        url
      }
      pis_pasep{
        _id
        name
        size
        url
      }
      titulo{
        _id
        name
        size
        url
      }
      cnh{
        _id
        name
        size
        url
      }
      doc_origem{
        _id
        name
        size
        url
      }
    }

    pessoa{
      pis_pasep
      doc_origem
      rg{
        numero
        orgao
        emissao
      }
      titulo{
        numero
        zone
        secao
        cidade
        uf
        emissao
      }
      cnh{
        numero
        type
        expira
        uf
        emissao
      }
      ctps{
        numero
        serie
        uf
      }
      alistamento{
        registro
        observacoes
      }
    }
    `;
    return this.getMilitarInfo(args, fields);
  }

  getTAFInfo(args) {
    let fields = `
      _patente
      _lotacao
      str_nomeguerra
      str_matricula
      pessoa{
        str_nome
        dt_nascimento
        str_sexo
      }
    `;
    return this.getMilitarInfo(args, fields);
  }

  async getMilitarById(_id) {
    let fields = `
      forca_id
      _patente
      _quadro
      str_nomecurto
      str_matricula
      str_nomeguerra
      militar_img
      lotacao{
        N1
        N2
        N3
      }
      pessoa{
        str_nome
        dt_nascimento
        str_sexo
      }
    `;
    return this.getMilitarInfo({ _id: _id }, fields);
  }

  async getUniformeMilitar(_id) {
    let fields = `
      str_nomecurto
      uniforme{
        camisainterna
        pront_cobertura
        pront_gandola
        pront_calca
        pront_coturno
        pront_cinto
        fino_cobertura
        fino_canicula
        fino_calca
        fino_sapato
        tfm_regata
        tfm_calcao
        tfm_tenis
        florest_calca
        florest_blusao
        incendio_epi
        agasalho_blusao
        agasalho_calca
      }
  `;
    return this.getMilitarInfo({ _id: _id }, fields);
  }

  async getMilitarByDtNascimento(args) {
    return this.graphql.query(environment.API.sisbom, 'graphql', {
      query: `
      query dt_nascimento($ano: String,$mes: String,$dia: String){
        dt_nascimento(ano: $ano,mes: $mes,dia: $dia){
          _id
          _patente
          _quadro
          str_nomeguerra
          str_nomecurto
          lotacao{
            N1
            N2
            N3
          }
          pessoa{
            dt_nascimento
          }
        }
      }`,
      name: "dt_nascimento",
      variables: args
    });
  }

  newPerson(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation CreateUser(
        $input: NewUserInput!
      ){
        CreateUser(
          input: $input
        ){
          msg
          status
        }
      }`,
      name: "CreateUser",
      variables: data
    }).then(data => {
      this.loadingService.hide();
      return data;
    })
  }

  editPerson(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation UpdateUser(
        $input: UserInput!
      ){
        UpdateUser(
          input: $input
        ){
          msg
          status
        }
      }`,
      name: "UpdateUser",
      variables: data
    }).then(data => {
      this.loadingService.hide();
      return data;
    })
  }

  delPerson(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation deleteUser($_id: ID){
        deleteUser(_id: $_id)
      }`,
      name: "deleteUser",
      variables: data
    }).then(data => {
      this.loadingService.hide();
      return data;
    })
  }

  savePerson(data) {
    return this[data.input._id ? 'editPerson' : "newPerson"](data);
  }

  saveUniform(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation CreateUniforme(
        $input: CreateUniformeInput!
      ){
        CreateUniforme(
          input: $input
        ){
          msg
          status
        }
      }`,
      name: "CreateUniforme",
      variables: data
    }).then(data => {
      this.loadingService.hide();
      return data;
    })
  }

  setImage(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation setImage(
        $input: MilitarImageInput!
      ){
        setImage(
          input: $input
        ){
          msg
          status
        }
      }`,
      name: "setImage",
      variables: { input: data }
    }).then(data => {
      this.loadingService.hide();
      return data;
    })
  }

  async saveIndex(data) {
    this.loadingService.show();
    let done = await this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation setIndex($input: [MilitarIndexInput]){
        setIndex(input: $input){
          msg
          status
        }
      }`,
      name: "setIndex",
      variables: { input: data }
    });
    this.loadingService.hide();
    return done;
  }

}
