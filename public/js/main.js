// FRONT-END (CLIENT) JAVASCRIPT HERE

// null means we're adding a new poem; a real id means we're editing that poem
let editingId = null

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  const authorInput = document.querySelector( '#author' ),
        titleInput   = document.querySelector( '#title' ),
        maqamsInput  = document.querySelector( '#maqams' ),
        yearInput    = document.querySelector( '#birthYear' )

  const maqams = maqamsInput.value
          .split( ',' )
          .map( function( m ) { return m.trim() } )
          .filter( function( m ) { return m.length > 0 } )

  const json = {
          author: authorInput.value,
          title: titleInput.value,
          maqams: maqams,
          birthYear: yearInput.value
        }

  // if we're editing an existing poem, include its id and hit /edit instead
  const url = editingId ? '/edit' : '/submit'
  if( editingId ) {
    json.id = editingId
  }

  const response = await fetch( url, {
    method:'POST',
    body: JSON.stringify( json )
  })

  const data = await response.json()

  showPoems( data )
  document.querySelector( '#poem-form' ).reset()

  // back to "add" mode
  editingId = null
  document.querySelector( '#poem-form button' ).textContent = 'Add Poem'
}

// builds the results table from the array of poems the server sends back
const showPoems = function( data ) {
  const tbody = document.querySelector( '#poem-rows' )
  tbody.innerHTML = ''

  data.forEach( function( poem ) {
    const row = document.createElement( 'tr' )

    row.innerHTML = `
      <td>${poem.author}</td>
      <td>${poem.title}</td>
      <td>${poem.maqams.join( ', ' )}</td>
      <td>${poem.era}</td>
      <td>${poem.mood}</td>
      <td>${poem.multiMaqam ? 'Yes' : 'No'}</td>
      <td>
        <button class="edit-button" data-id="${poem.id}">Edit</button>
        <button class="delete-button" data-id="${poem.id}">Delete</button>
      </td>
    `

    tbody.appendChild( row )
  })

  const deleteButtons = document.querySelectorAll( '.delete-button' )

  deleteButtons.forEach( function( button ) {
    button.onclick = function() {
      deletePoem( Number( button.dataset.id ) )
    }
  })

  const editButtons = document.querySelectorAll( '.edit-button' )

  editButtons.forEach( function( button ) {
    button.onclick = function() {
      const id = Number( button.dataset.id )
      startEdit( id, data )
    }
  })
}

// fills the form with an existing poem's values so it can be edited
const startEdit = function( id, data ) {
  const poem = data.find( function( p ) { return p.id === id } )

  document.querySelector( '#author' ).value = poem.author
  document.querySelector( '#title' ).value = poem.title
  document.querySelector( '#maqams' ).value = poem.maqams.join( ', ' )
  document.querySelector( '#birthYear' ).value = poem.birthYear

  editingId = id
  document.querySelector( '#poem-form button' ).textContent = 'Save Changes'
}

// same idea as submit above, but hits /delete instead of /submit
const deletePoem = async function( id ) {
  const json = { id },
        body = JSON.stringify( json )

  const response = await fetch( '/delete', {
    method: 'POST',
    body
  })

  const data = await response.json()

  showPoems( data )
}

// loads whatever poems are already on the server when the page first opens
const loadPoems = async function() {
  const response = await fetch( '/data' )
  const data = await response.json()

  showPoems( data )
}

window.onload = function() {
  const button = document.querySelector('button')
  button.onclick = submit

  loadPoems()
}
