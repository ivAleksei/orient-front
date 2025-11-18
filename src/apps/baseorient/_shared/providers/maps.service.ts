import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';
import { HttpService } from 'src/_shared/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private http: HttpService,
    private loadingService: LoadingService,
    private alertsService: AlertsService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }
  trigger() {
    this._watch.next(true);
  }

  async getMaps(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Maps{
        Maps{
          _id
          ${fields}
        }
      }`,
      name: "Maps",
      variables: args || {}
    });
  }
  async getMapById(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query MapById($_id: ID){
        MapById(_id: $_id){
          _id
          ${fields}
        }
      }`,
      name: "MapById",
      variables: args || {}
    });
  }

  newMap(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateMap($input: MapInput){
        CreateMap(input: $input){
          status
          msg
        }
      }`,
      name: "CreateMap",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editMap(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateMap($input: MapInput){
        UpdateMap(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateMap",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delMap(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteMap($_id: ID){
          deleteMap(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteMap",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveMap(data) {
    return this[data._id ? 'editMap' : "newMap"]({ input: data });
  }


  // Raio da Terra em metros (aprox. WGS84)
  R: number = 6378137;

  // Inverte uma matriz 3x3
  invert3x3(m) {
    const [
      [a, b, c],
      [d, e, f],
      [g, h, i]
    ] = m;

    const A = e * i - f * h;
    const B = -(d * i - f * g);
    const C = d * h - e * g;
    const D = -(b * i - c * h);
    const E = a * i - c * g;
    const F = -(a * h - b * g);
    const G = b * f - c * e;
    const H = -(a * f - c * d);
    const I = a * e - b * d;

    const det = a * A + b * B + c * C;
    if (Math.abs(det) < 1e-12) {
      throw new Error("Matriz singular, pontos degenerados (não dá pra montar a transformação).");
    }

    const invDet = 1 / det;
    return [
      [A * invDet, D * invDet, G * invDet],
      [B * invDet, E * invDet, H * invDet],
      [C * invDet, F * invDet, I * invDet]
    ];
  }

  // Multiplica matriz 3x3 por vetor 3x1
  mulMat3Vec3(m, v) {
    return {
      x: m[0][0] * v.x + m[0][1] * v.y + m[0][2] * v.z,
      y: m[1][0] * v.x + m[1][1] * v.y + m[1][2] * v.z,
      z: m[2][0] * v.x + m[2][1] * v.y + m[2][2] * v.z
    };
  }

  /**
   * Calcula a transformação afim imagem -> mapa real a partir de 3 pontos.
   *
   * @param {Array<{lat:number, lng:number}>} ptsGeo - [A, B, C] em lat/lng
   * @param {Array<{x:number, y:number}>} ptsImg  - [A', B', C'] em pixels
   * @returns {{a1:number, a2:number, a3:number, b1:number, b2:number, b3:number}}
   */
  computeImageToMapTransform(ptsGeo, ptsImg) {
    if (ptsGeo.length !== 3 || ptsImg.length !== 3) {
      throw new Error("São necessários exatamente 3 pontos geo e 3 pontos de imagem.");
    }

    // 1) Converte os 3 pontos geo para coordenadas Mercator (X,Y)
    const merc = ptsGeo.map(p => this.latLngToMercator(p.lat, p.lng));

    // Monta matriz M com as coords de imagem
    // M * [a1, a2, a3]^T = [X1, X2, X3]^T
    // M * [b1, b2, b3]^T = [Y1, Y2, Y3]^T
    const M = [
      [ptsImg[0].x, ptsImg[0].y, 1],
      [ptsImg[1].x, ptsImg[1].y, 1],
      [ptsImg[2].x, ptsImg[2].y, 1]
    ];

    const invM = this.invert3x3(M);

    const vecX = { x: merc[0].x, y: merc[1].x, z: merc[2].x };
    const vecY = { x: merc[0].y, y: merc[1].y, z: merc[2].y };

    const solX = this.mulMat3Vec3(invM, vecX);
    const solY = this.mulMat3Vec3(invM, vecY);

    const a1 = solX.x, a2 = solX.y, a3 = solX.z;
    const b1 = solY.x, b2 = solY.y, b3 = solY.z;

    return { a1, a2, a3, b1, b2, b3 };
  }

  /**
   * Calcula os 4 cantos da imagem em lat/lng
   *
   * @param {{a1:number,a2:number,a3:number,b1:number,b2:number,b3:number}} T - transformação imagem->mapa
   * @param {number} width  - largura da imagem em px
   * @param {number} height - altura da imagem em px
   * @returns {{topLeft, topRight, bottomRight, bottomLeft}}
   */
  getImageCornersLatLng(T, width, height) {
    const topLeft = { x: 0, y: 0, ...this.imagePointToLatLng(T, 0, 0) };
    const topRight = { x: width, y: 0, ...this.imagePointToLatLng(T, width, 0) };
    const bottomRight = { x: width, y: height, ...this.imagePointToLatLng(T, width, height) };
    const bottomLeft = { x: 0, y: height, ...this.imagePointToLatLng(T, 0, height) };
    // const topRight = this.imagePointToLatLng(T, width, 0);
    // const bottomRight = this.imagePointToLatLng(T, width, height);
    // const bottomLeft = this.imagePointToLatLng(T, 0, height);

    return { topLeft, topRight, bottomRight, bottomLeft };
  }

  /**
   * Aplica a transformação afim para converter (x,y) de imagem em lat/lng.
   *
   * @param {{a1:number,a2:number,a3:number,b1:number,b2:number,b3:number}} T
   * @param {number} x - coordenada X na imagem (pixel)
   * @param {number} y - coordenada Y na imagem (pixel)
   * @returns {{lat:number, lng:number}}
   */
  imagePointToLatLng(T, x, y) {
    const X = T.a1 * x + T.a2 * y + T.a3; // coord X em Mercator
    const Y = T.b1 * x + T.b2 * y + T.b3; // coord Y em Mercator
    return this.mercatorToLatLng(X, Y);
  }

  latLngToImagePoint(T, lat, lng) {
    // 1) Converte lat/lng para Mercator
    const XY = this.latLngToMercator(lat, lng);

    // 2) Remove a translação (a3, b3)
    const Xp = XY.x - T.a3;
    const Yp = XY.y - T.b3;

    // 3) Matriz 2x2 e determinante
    const det = T.a1 * T.b2 - T.a2 * T.b1;
    if (Math.abs(det) < 1e-12) {
      throw new Error("Transformação afim degenerada, det = 0");
    }

    const invDet = 1 / det;

    // 4) Aplica matriz inversa
    const x = Math.floor((T.b2 * Xp - T.a2 * Yp) * invDet);
    const y = Math.floor((-T.b1 * Xp + T.a1 * Yp) * invDet);

    return { x, y };
  }

  latLngToMercator(lat, lng) {
    const x = this.R * (lng * Math.PI / 180);
    const y = this.R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));
    return { x, y };
  }

  mercatorToLatLng(x, y) {
    const lng = (x / this.R) * 180 / Math.PI;
    const lat = (2 * Math.atan(Math.exp(y / this.R)) - Math.PI / 2) * 180 / Math.PI;
    return { lat, lng };
  }

  aplicarEscala(topLeft, bottomRightOriginal, factor) {
    return {
      lat: topLeft.lat + factor * (bottomRightOriginal.lat - topLeft.lat),
      lng: topLeft.lng + factor * (bottomRightOriginal.lng - topLeft.lng),
    };
  }


  /**
   * Distância entre coordenadas
   * @param lat1 
   * @param lon1 
   * @param lat2 
   * @param lon2 
   * @returns 
   */
  havDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(a));
  }

}