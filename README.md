## Transit Locator

#About
Transit Locator allows you to search using a city or address to find transit stops. It will display realtime bus data for selected cities like San Fransisco, New York, and Chicago.

#Tech
The app is built using Gulp, Angular, Sass, and Jade. And utilizes Google maps Javascript API and Places Library. Realtime bus data provided by https://publicdata-transit.firebaseio.com/

#Run
You can run the app by opening index.html in your browser, located in transit-locator/dist/

or

$ npm install
$ bower intall
$ gulp serve 


#Gulp tasks 
- `$ gulp` to build an optimized version of your application in folder dist
- `$ gulp serve` to start BrowserSync server on your source files with live reload
- `$ gulp serve:dist` to start BrowserSync server on your optimized application without live reload
- `$ gulp test` to run your unit tests with Karma
- `$ gulp test:auto` to run your unit tests with Karma in watch mode
- `$ gulp protractor` to launch your e2e tests with Protractor
- `$ gulp protractor:dist` to launch your e2e tests with Protractor on the dist file