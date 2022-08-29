# Documento de servicio        

## Conectividad y Territorio

### Descripción general del servicio

[Conectividad a internet y territorio](https://opendata.aragon.es/servicios/indicadores-conectividad-aragon) es un servicio basado en datos abiertos que permite conocer la relación entre los datos de conectividad a internet y aspectos sociales, económicos y de infraestructuras en Aragón. Además, cuenta con una versión accesible que ofrece los datos del servicio de Conectividad a internet y territorio en una tabla.

### Componentes del servicio y Tecnologías utilizadas

**FRONTEND**

- Aplicación Angular:
Aplicación que muestra en un mapa los datos obtenidos desde las APIs ofrecidas por el Geoserver. También conecta con el servicio de búsqueda del IGEAR para que, a través del nombre de un municipio o CP devuelva la información necesaria para luego usarse y filtrar los datos de las capas del Geoserver. 
El proyecto se ha desarrollado en Angular CLI en su versión 11.2.10 [https://github.com/angular/angular-cli]. 
Para la parte lógica se ha utilizado TypeScript. Para la parte de estilos se hace uso de frameworks como Sass, Bootstrap y Tailwind. 
Como es propio de Angular CLI, para los test unitarios se hace uso de las herramientas como Karma y Jasmine, que ya vienen configuradas por defecto. [https://karma-runner.github.io] 
En su defecto, para las pruebas EndToEnd se utiliza el framework Protractor. [http://www.protractortest.org/] 

**BACKEND**
- Base de datos:
Lugar donde están almacenados los indicadores. La base de datos utilizada en este proyecto ha sido PostgreSQL. 

- Geoserver:
Servidor del IGEAR. En él se crean capas de datos basadas en los datos de dicha base de datos y se ofrecen como APIs Rest.

### Guía de despliegue y pruebas

1. Generación y creación de imágenes Docker

 La aplicación se despliega en Docker, para ello lo primero que tenemos que realizar es crear la imagen de Docker en el repositorio correspondiente. 

    * Descargar el Dockerfile y editar archivo environment.ts correspondiente`
    * Compilar la imagen : `sudo docker build --no-cache -t aod/conectividad .`

2. Modificación del Docker compose y lanzamiento del servicio 

    * Editar *docker-compose.yml* y añadir la configuración del servicio conectividad.
    * Lanzar servicio `sudo docker-compose up -d conectividad`

### Guía de mantenimiento 


1. **Gestión de la aplicación web**

   Aplicación desarrollada en Angular compuesta por diferentes componentes que dan forma a dicha aplicación.

    1. Encabezado 
    Formado por el selector de capas y el buscador.
    La ruta para poder modificarlos es la siguiente `conectividad-territorio/src/app/main/header` que se componen de 
    .html, .ts, y .css para la lógica y estilos de éste.

    2. Mapa 
    El mapa de la aplicación está formado por un mapa base que es el mapa de los servicios del IGEAR y por otro lado por las capas de los indicadores.
    La ruta en el proyecto es `conectividad-territorio/src/environments/environments.ts`

    3. Capas de indicadores 
    Todas las capas se encuentran en `conectividad-territorio/src/app/shared/services/map.service.ts`
    Cada una de ellas presentan sus propiedades las cuales se podrán modificar según el resultado que se busque.

    4. Pop up 
    Se trata de un pop up dinámico en función de los datos cargados en cada capa.
    La ruta en el proyecto es `conectividad-territorio/src/app/popup/`

    5. Pie de página 
    La aplicación cuenta con un pie de página que te redirige a diferentes fuentes de
    información. Esto se define en la ruta:
    `conectividad-territorio\src\app\main\footer\`

