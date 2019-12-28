const functions = require("firebase-functions")
const admin = require("firebase-admin")
const express = require("express")
const cors = require("cors")
const path = require("path")

const firebase = admin.initializeApp()
const db = admin.firestore()

// Delete all cloud firestore documents for a particular resource (e.g., presentations, players, etc.)
const deleteResourceDocuments = async (uid, resource) => {
	const resourceRef = db
		.collection("users")
		.doc(uid)
		.collection(resource)
	// query cloud firestore for all documents under resources collection
	const querySnapshot = await resourceRef.get()
	const pending = []
	querySnapshot.forEach(doc => {
		console.log(`deleting ${resource} firestore doc - id: ${doc.id}`)
		// delete document, store promise
		pending.push(doc.ref.delete())
	})
	// wait for all firestore deletes to complete
	await Promise.all(pending)
	// delete resource collection
	console.log(`all associated ${resource} documents have been deleted`)
	return null
}

// Delete firestore user root document whose id is the user's auth uid
// Called after all child resource documents have been deleted
const deleteRootDocument = uid => {
	return db
		.collection("users")
		.doc(uid)
		.delete()
}

// Delete all user files uploaded to google storage bucket
const deleteUserStorage = uid => {
	const bucket = admin.storage().bucket()
	return bucket.deleteFiles({ prefix: `users/${uid}` })
}

// Handle user creation events
// Create /users/{uid} doc for firebase database and storage
exports.createUser = functions.auth.user().onCreate(user => {
	console.log(`user account for ${user.email} creating - uuid: ${user.uid}`)
	return admin
		.firestore()
		.doc(`users/${user.uid}`)
		.set({ email: user.email })
})

// User authentication account has been deleted
// Delete all associated firestore documents and uploaded presentation files
exports.deleteUser = functions.auth.user().onDelete(async user => {
	console.log(`user account deleted - email: ${user.email}, uid: ${user.uid}`)
	try {
		await deleteResourceDocuments(user.uid, "presentations")
		await deleteResourceDocuments(user.uid, "players")
		await deleteResourceDocuments(user.uid, "schedules")
		await deleteRootDocument(user.uid)
		await deleteUserStorage(user.uid)
		return null
	} catch (error) {
		console.log("detected error while deleting user's resources", error)
	}
})

// Trigger cloud function whenever presentation file uploaded to firebase storage
// Currently a no-op but could be used to do post upload tasks like enforce file upload rules
exports.presentationUploaded = functions.storage
	.object()
	.onFinalize(async object => {
		const filePath = object.name
		const baseFileName = path.basename(filePath, path.extname(filePath))
		const fileDir = path.dirname(filePath)
		const fileSize = object.size
		console.log("detected storage file upload")
		console.log(
			`file name: ${baseFileName}, size: ${fileSize}, dir: ${fileDir}`
		)
		return null
	})

// Trigger cloud function whenever presentation file deleted from firebase storage
// Perform any necessary post file delete housekeeping
exports.presentationDeleted = functions.storage
	.object()
	.onDelete(async object => {
		const filePath = object.name
		console.log(`deleted storage file ${filePath}`)
		return null
	})
