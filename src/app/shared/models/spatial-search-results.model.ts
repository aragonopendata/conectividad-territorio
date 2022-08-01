export interface SpatialSearchResults {
    resultados: Resultados[]
}

interface Resultados {
    capa: string
    distancia: number
    featureCollection: FeatureCollection
}

interface FeatureCollection {
    crs: CRS
    features: Feature[]
    totalFeatures: number
    type: string
}

interface CRS {
    properties: CRSProperties
    type: string
}

interface CRSProperties {
    name: string
}

interface Feature {
    id: string
    properties: FeatureProperties
    type: string
}

interface FeatureProperties {
    objectid: string
}
