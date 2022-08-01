export interface WFSResponse {
    crs: CRS
    features: Feature[]
    fotalFeatures: number
    type: string
}

interface CRS {
    type: string
    properties: CRSProperties[]
}

interface CRSProperties {
    name: string
}

interface Feature {
    geometry: object
    geometry_name: string
    id: string
    properties: FeatureProperties
    type: string
}

interface FeatureProperties {
    c_mun_via: string
    objectid: number
    valores: string
    via_loc: string
}

export enum TypeZone2022 {
    A = 'A Blanca NGA',
    B = 'B Gris NGA menos 100 Mbps',
    NONE = 'Ninguna'
}

export enum TypeZone2021 {
    A = 'Blanca',
    B = 'Gris',
    NONE = 'Ninguna'
}