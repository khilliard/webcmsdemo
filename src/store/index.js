import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		// Application-defined CMS resources (stored in firestore database)
		// These are cloud firestore collection endpoints which store CMS resource documents
		appResources: ["presentations", "players", "schedules"],
		// when user logs into the firebase user object is stored here
		user: null,
		// Cloud firstore mirrored CMS resource documents
		// Realtime subscriptions will keep vuex store synched to cloud firestore database
		presentations: [],
		players: [],
		groups: [],
		schedules: [],
		appState: "connecting"
	},

	mutations: {
		// Update vuex store to reflect user's authentication state
		// If logged in set state to firebase user authentication object, otherwise null
		setUser(state, user) {
			state.user = user
			state.appState = "online"
		},
		// add (mirror) cloud firestore CMS resource document to vuex store
		addResource(state, payload) {
			console.log(
				`adding firestore '${payload.resource}' document to vuex store - doc id: ${payload.doc.id}`,
				payload.doc.data()
			)
			state[payload.resource].push(payload.doc)
		},
		// firestore document changed, update (mirror) associated vuex element
		modifyResource(state, payload) {
			console.log(
				`firebase document modified, update vuex store - resource: ${payload.resource}, id: ${payload.doc.id}`
			)
			const doc = payload.doc
			const docID = payload.doc.id
			// create deep copy of vuex resource
			const resource = state[payload.resource].map(el => {
				// replace modified vuex resource document with updated value from cloud firestore database
				return el.id === docID ? doc : el
			})
			state[payload.resource] = resource
		},
		// firestore document deleted, update (mirror) vuex state
		removeResource(state, payload) {
			const docID = payload.doc.id
			const resource = state[payload.resource].filter(el => {
				// remove deleted document from vuex state
				return el.id !== docID
			})
			state[payload.resource] = resource
		},
		clearAppResources(state) {
			state.presentations = []
			state.players = []
			state.groups = []
			state.schedules = []
		}
	},

	getters: {
		isLoggedIn(state) {
			return state.user ? true : false
		},
		// return retrieved presentations sorted by creation date
		presentations(state) {
			return state.presentations.sort((p1, p2) => {
				const p1Data = p1.data()
				const p2Data = p2.data()
				// if createdAt field doesn't exists then return unsorted list
				return p1Data.createdAt && p2Data.createdAt
					? p1Data.createdAt.seconds - p2Data.createdAt.seconds
					: -1
			})
		},
		// return retrieved players sorted by creation date
		players(state) {
			return state.players.sort((p1, p2) => {
				const p1Data = p1.data()
				const p2Data = p2.data()
				// if createdAt field  doesn't exists then return unsorted list
				return p1Data.createdAt && p2Data.createdAt
					? p1Data.createdAt.seconds - p2Data.createdAt.seconds
					: -1
			})
		},
		// return schedules presentations sorted by creation date
		schedules(state) {
			return state.schedules.sort((p1, p2) => {
				const p1Data = p1.data()
				const p2Data = p2.data()
				// if createdAt field doesn't exists then return unsorted list
				return p1Data.createdAt && p2Data.createdAt
					? p1Data.createdAt.seconds - p2Data.createdAt.seconds
					: -1
			})
		}
	},

	actions: {},
	modules: {}
})
