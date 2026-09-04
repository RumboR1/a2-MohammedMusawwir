const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // On Render, make sure `npm install` is your build command.
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000

var appdata = [
  { id: 1, author: 'Al-Busiri', title: 'The Mantle Ode', maqams: [ 'Bayati', 'Hijaz', 'Nahawand' ], birthYear: 1212 },
  { id: 2, author: 'Nizar Qabbani', title: 'Bread, Hashish and Moon', maqams: [ 'Rast' ], birthYear: 1923 },
  { id: 3, author: 'Mahmoud Darwish', title: 'Identity Card', maqams: [ 'Saba' ], birthYear: 1941 }
]

var nextId = 4
 
var moodByMaqam = {
  rast: 'Proud and powerful',
  bayati: 'Powerful and serious',
  hijaz: 'Mysterious and yearning',
  saba: 'Sad and aching',
  kurd: 'Romantic and gentle',
  nahawand: 'Dramatic and romantic',
  ajam: 'Happy and majestic',
  sikah: 'Solemn',
  jiharkah: 'Happy and upbeat'
}

function getMood(maqam) {
  var m = maqam.toLowerCase()
  var mood = moodByMaqam[ m ]

  if (mood) {
    return mood
  }

  else { 
    return 'Unclassified'
  }
}

function addDerivedFields( poem ) {
  poem.era = poem.birthYear >= 1800 ? 'Modern' : 'Classical'
  poem.mood = poem.maqams.map(function (maqam) { 
    return getMood(maqam)}).join('/');
  poem.multiMaqam = poem.maqams.length > 1

  return poem
}

// add the derived fields to the starting poems
for( var i = 0; i < appdata.length; i++ ) {
  appdata[ i ] = addDerivedFields( appdata[ i ] )
}

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }
})

const handleGet = function( request, response ) {

  // send back the list of poems as json
  if( request.url === '/data' ) {
    response.writeHead( 200, { 'Content-Type': 'application/json' })
    response.end( JSON.stringify( appdata ) )
    return
  }

  const filename = dir + request.url.slice( 1 ) 

  if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  }else{
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    const body = JSON.parse( dataString )

    if( request.url === '/submit' ) {
      let newPoem = {
        id: nextId,
        author: body.author,
        title: body.title,
        maqams: body.maqams,
        birthYear: Number( body.birthYear )
      }

      nextId = nextId + 1
      newPoem = addDerivedFields( newPoem )
      appdata.push( newPoem )
    }

    if( request.url === '/delete' ) {
      appdata = appdata.filter( function( poem ) {
        return poem.id !== body.id
      })
    }

    if ( request.url === '/edit' ) {
      for( var i = 0; i < appdata.length; i++ ) {
        if( appdata[ i ].id === body.id ) {
          appdata[ i ].author = body.author
          appdata[ i ].title = body.title
          appdata[ i ].maqams = body.maqams
          appdata[ i ].birthYear = Number( body.birthYear )
          appdata[ i ] = addDerivedFields( appdata[ i ] )
        }
      }
    }

    response.writeHead( 200, { 'Content-Type': 'application/json' })
    response.end( JSON.stringify( appdata ) )
  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )
