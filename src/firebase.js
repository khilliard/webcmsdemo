import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/storage"
import "firebase/auth"

import router from "./router"
import store from "./store"
import { allResolved } from "q"

const firebaseConfig = {
	apiKey: "AIzaSyA-C3wt3kiW9hO5EVa9ZOr2YY6Xh7d_jxg",
	authDomain: "webcms-1f3c9.firebaseapp.com",
	databaseURL: "https://webcms-1f3c9.firebaseio.com",
	projectId: "webcms-1f3c9",
	storageBucket: "webcms-1f3c9.appspot.com",
	messagingSenderId: "98346662758",
	appId: "1:98346662758:web:71fbb8ced0fd67ba9366a7",
	measurementId: "G-G4F9NKVLCQ"
}

// initialize firebase app instance
const firebaseApp = firebase.initializeApp(firebaseConfig)

// create and store references to key firebase services
firebaseApp.db = firebase.firestore()
firebaseApp.auth = firebase.auth()
firebaseApp.storage = firebase.storage()

const unsubscribes = []
let initialized = false

// inject firestore helper methods into firebase app object
// callers must wrap method invocation in try/catch block
firebaseApp.login = async (email, password) => {
	return await firebaseApp.auth.signInWithEmailAndPassword(email, password)
}

firebaseApp.logout = async () => {
	return await firebaseApp.auth.signOut()
}

firebaseApp.signup = async (email, password) => {
	return await firebaseApp.auth.createUserWithEmailAndPassword(email, password)
}

////////////////////////////////////////////////////
// Upload presentation file to firebase storage 	//
// Store at 'users/${uid}/presentations' endpoint //
////////////////////////////////////////////////////
firebaseApp.uploadFile = async (filePath, file) => {
	const user = firebaseApp.auth.currentUser
	console.log(`uploading ${file.name} to ${filePath}`)
	const storageRef = firebaseApp.storage.ref(filePath)
	return await storageRef.put(file)
}

////////////////////////////////////////////////////////
// Add document to firestore database at endpoint			//
// Document will be added at 'users/{uid}/endpoint'		//
////////////////////////////////////////////////////////
firebaseApp.addDocument = async (endpoint, doc) => {
	const user = firebaseApp.auth.currentUser
	const timestamp = firebase.firestore.FieldValue.serverTimestamp()
	doc.createdAt = timestamp
	return await firebaseApp.db
		.collection("users")
		.doc(`${user.uid}`)
		.collection(endpoint)
		.add(doc)
}

////////////////////////////////////////////////////////////
// Document modified by client, update firestore database	//
////////////////////////////////////////////////////////////
firebaseApp.updateDocument = async (doc, docData) => {
	const timestamp = firebase.firestore.FieldValue.serverTimestamp()
	docData.updatedAt = timestamp
	return await doc.ref.update(docData)
}

////////////////////////////////////////////////
// Retrieve document from firestore database	//
////////////////////////////////////////////////
firebaseApp.retrieveDocument = async docPath => {
	return await firebaseApp.db.doc(docPath).get()
}

// Query collection endpoint for matching document(s)
firebaseApp.queryDocument = async (endpoint, query) => {
	const user = firebaseApp.auth.currentUser
	return await firebaseApp.db
		.collection("users")
		.doc(`${user.uid}`)
		.collection(endpoint)
		.where(query.param1, query.op, query.param2)
		.get()
}

//////////////////////////////////////////////
// Delete document from firestore database	//
//////////////////////////////////////////////
firebaseApp.deleteDocument = async doc => {
	return await doc.ref.delete()
}

//////////////////////////////////////////////
// Delete file from in firebase storage			//
//////////////////////////////////////////////
firebaseApp.deleteFile = async filePath => {
	const result = await firebaseApp.storage.ref(filePath).delete()
	console.log("firestore document delete await completed")
	return result
}

//
firebaseApp.queryResource = async resource => {
	console.log(`querying firestore for '${resource}' documents`)
	const endpoints = []
	const user = firebaseApp.auth.currentUser
	const ref = firebaseApp.db
		.collection("users")
		.doc(`${user.uid}`)
		.collection(resource)
	console.log("***** collection reference", ref)
	await ref.get().then(querySnapshot => {
		querySnapshot.forEach(doc => {
			// console.log(`query doc id: ${doc.id}, data:`, doc.data())
			endpoints.push(doc)
		})
	})
	return endpoints
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Create realtime subscription which listens for changes to firestore resource documents 	//
// Syncs firestore resource doc changes (ADD/MODIFY/REMOVE) to vuex (reactive) store				//
// Firestore resources document classes: presentations, players, groups and schedules				//
//////////////////////////////////////////////////////////////////////////////////////////////
firebaseApp.subscribeResource = resource => {
	let user = firebaseApp.auth.currentUser
	console.log(`creating realtime database listener for '${resource}' resource`)
	// capture returned 'unsubscribe method which is called when user logs out
	const unsubscribe = firebaseApp.db
		.collection("users")
		.doc(user.uid)
		.collection(resource)
		.onSnapshot(snapshot => {
			snapshot.docChanges().forEach(change => {
				// check if doc added to firestore
				if (change.type === "added") {
					const doc = change.doc
					console.log(
						`realtime subscription ADD event - resource: '${resource}', doc id: ${doc.id}, data:`,
						doc.data()
					)
					// add firestore resource document to vuex store
					store.commit("addResource", { resource, doc })
				}
				// check if doc modified
				if (change.type === "modified") {
					const doc = change.doc
					console.log(
						`realtime resource modified event - id: ${doc.id}, type: ${resource}`
					)
					// update resource document in vuex store
					store.commit("modifyResource", { resource, doc: doc })
				}
				// check if doc deleted to firestore
				if (change.type === "removed") {
					const doc = change.doc
					console.log(
						`realtime resource removed event - id: ${doc.id}, type: ${doc.ref.parent.id}`
					)
					// delete resource document from vuex store
					store.commit("removeResource", { resource, doc: doc })
				}
			})
		})
	unsubscribes.push(unsubscribe)
}

// Remove all realtime resource subscriptions and clear vuex backing store
firebaseApp.unsubscribeResources = () => {
	console.log("clearing all realtime resource subscriptions")
	unsubscribes.forEach(unsubscribe => {
		console.log("unsubscribed realtime listner")
		unsubscribe()
	})
	// clear all resources in vuex store
	store.commit("clearAppResources")
}

//////////////////////////////////////////////////////////////////////////////////////////
// Initialize firebase realtime subscription/listeners - called at startup (main.js)		//
// Return a promise which when resolved will result in vue root instance being created 	//
//////////////////////////////////////////////////////////////////////////////////////////
firebaseApp.startup = () => {
	console.log("initializing firebase subscription listeners")
	// ensure that we are only called once
	if (initialized) {
		return Promise.resolve(true)
	}
	return new Promise((resolve, reject) => {
		firebaseApp.auth.onAuthStateChanged(user => {
			// check if user logged in
			if (user) {
				const today = new Date()
				const lastLogin = new Date(Date.parse(user.metadata.lastSignInTime))
				const loginTime = Math.floor((today - lastLogin) / (60000 * 60))
				console.log(
					`user state logged in - email: ${user.email}, last login: ${lastLogin}, today: ${today}, total login time: ${loginTime} hours`
				)
				// store firestore user auth object in vuex
				store.commit("setUser", user)
				//////////////////////////////////////////////////////////////////////////////////////////////
				// When a user logs in:																																			//
				// Create realtime firestore subscription for each resource (presentations, players, etc.)	//
				// A subscription listener tracks changes (ADD/MODIFY/REMOVE) to firestore resources 				//
				// This allows us to model resources in vuex store and create reactive UI resource elements	//
				//////////////////////////////////////////////////////////////////////////////////////////////
				store.state.appResources.forEach(resource => {
					firebaseApp.subscribeResource(resource)
				})
			}
			// Otherwise user is logged out
			else {
				console.log("user currently not logged in")
				store.commit("setUser", null)
				////////////////////////////////////////////////////////////////////////////////
				// When a user logs out:																											//
				// Clear all realtime firestore resource subscriptions and update vuex models	//
				////////////////////////////////////////////////////////////////////////////////
				firebaseApp.unsubscribeResources()
				router.push("/login")
			}
			// create root vue instance once user's auth status is initialized
			if (!initialized) {
				console.log("firebase setup complete, resolving promise")
				initialized = true
				resolve(user ? true : false)
			}
		})
	})
}

export default firebaseApp
