<template>
	<div>
		<!-- Allow user to create/upload presentation file to CMS -->
		<v-dialog v-model="filePopup" max-width="600">
			<template v-slot:activator="{ on }">
				<v-btn color="amber" text @click="displayUploadForm" v-on="on">
					Upload
				</v-btn>
			</template>
			<v-card outline>
				<v-card-title class="primary mb-3">Upload File to CMS</v-card-title>
				<v-card-text>
					<!-- presentation file upload form -->
					<v-form ref="uploadForm" v-model="valid">
						<v-text-field
							v-model="name"
							label="Presentation name"
							autofocus
							required
						/>
						<v-file-input v-model="file" label="Select file to upload" />
						<v-btn
							class="primary"
							:loading="loading"
							:disabled="!isValid"
							@click="uploadFile"
						>
							Upload
						</v-btn>
						<v-btn class="ml-3" @click="filePopup = false">Cancel</v-btn>
					</v-form>
				</v-card-text>
			</v-card>
		</v-dialog>
		<v-dialog v-model="error" max-width="400">
			<v-card>
				<v-card-title class="red mb-3">
					File Upload Error
				</v-card-title>
				<v-card-text>
					Unable to upload file to the CMS. Make sure the file size is less than
					512K
				</v-card-text>
				<v-card-actions>
					<v-btn @click="error = false">Close</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- display after-upload message to user -->
		<v-snackbar
			v-model="presentationCreated"
			color="primary"
			:multi-line="true"
			:timeout="10000"
			top
		>
			<span>
				Click item to edit. Click <span style="color: #FFC107;">Assign</span> to
				assign a presentation to one or more media players or groups for signage
				display.
			</span>
			<v-btn text dark class="ml-1 black" @click="presentationCreated = false">
				Close
			</v-btn>
		</v-snackbar>
	</div>
</template>

<script>
import { mapState } from "vuex"
import firebaseApp from "@/firebase"

export default {
	name: "PresentationUpload",

	data() {
		return {
			loading: false,
			filePopup: false,
			name: "",
			file: null,
			emptyMsg: "",
			valid: false,
			nameRules: [v => !!v || "A presentation name is required"],
			fileRules: [v => !!v || "Select a file to upload"],
			presentationCreated: false,
			error: false
		}
	},

	computed: {
		...mapState(["user"]),
		isValid() {
			return this.loading ? false : this.name && this.file ? true : false
		}
	},

	methods: {
		displayUploadForm() {
			this.name = ""
			this.file = null
			this.filePopup = true
		},

		//////////////////////////////////////////////////////////////////////////////////////////
		// Upload form submit handler - upload selected presentation file to firebase storage 	//
		// Add presentation firestore resource doc to model the uploaded file 									//
		//////////////////////////////////////////////////////////////////////////////////////////
		async uploadFile() {
			console.log(
				`uploading presentation - name: ${this.name}, file name:`,
				this.file.name
			)
			this.loading = true
			const now = Date.now()
			// construct storage pathname with a time stamp bit to avoid file name clashes
			const filePath = `users/${this.user.uid}/presentations/${now}/${this.file.name}`
			try {
				await firebaseApp.uploadFile(filePath, this.file)
				await firebaseApp.addDocument("presentations", {
					name: this.name,
					filePath: filePath
				})
				console.log("file successfully uploaded")
				this.presentationCreated = true
			} catch (error) {
				console.log("***** error uploading file", error)
				this.error = true
			} finally {
				this.loading = false
				this.filePopup = false
				this.$refs.uploadForm.reset()
			}
		}
	}
}
</script>
