<template>
    <div class="container">
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Users Table</h3>

                        <div class="card-tools">
                            <button type="button" class="btn btn-success" @click="openModal">
                                Add New
                                <i class="fa fa-user-plus fa-fw"></i>
                            </button>
                        </div>
                    </div>
                    <!-- /.card-header -->
                    <div class="card-body table-responsive p-0">
                        <table class="table table-hover">
                            <tbody>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Type</th>
                                    <th>Registered At</th>
                                    <th>Modify</th>
                                </tr>
                                <!-- Displaying Users that we fetched in the users object -->
                                <tr v-for="user in users" :key="user.id">
                                    <td>{{ user.id }}</td>
                                    <td>{{ user.name }}</td>
                                    <td>{{ user.email }}</td>
                                    <td>{{ user.type | capitalize}}</td>
                                    <td>{{ user.created_at | formateDateTime}}</td>
                                    <td>
                                        <a @click="openUpdateModal(user)">
                                            <i class="fa fa-edit blue"></i>
                                        </a>
                                        /
                                        <a @click="deleteUser(user.id)">
                                            <i class="fa fa-trash red"></i>
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- /.card-body -->
                </div>
                <!-- /.card -->
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="addNew" tabindex="-1" role="dialog" aria-labelledby="addNewLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 v-show="!updateMode" class="modal-title" id="addNewLabel">Add New</h5>
                        <h5 v-show="updateMode" class="modal-title" id="addNewLabel">Update User's Info.</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form @submit.prevent="updateMode ? updateUser() : createUser()">
                        <div class="modal-body">
                            <div class="form-group">
                                <input v-model="form.name" type="text" name="name" placeholder="Name"
                                    class="form-control" :class="{ 'is-invalid': form.errors.has('name') }">
                                <has-error :form="form" field="name"></has-error>
                            </div>
                            <div class="form-group">
                                <input v-model="form.email" type="email" name="email" placeholder="Email"
                                    class="form-control" :class="{ 'is-invalid': form.errors.has('email') }">
                                <has-error :form="form" field="email"></has-error>
                            </div>
                            <div class="form-group">
                                <input v-model="form.password" type="password" name="password" id="password" placeholder="Password"
                                class="form-control" :class="{ 'is-invalid': form.errors.has('password') }">
                                <has-error :form="form" field="password"></has-error>
                            </div>
                            <div class="form-group">
                                <select name="type" v-model="form.type" id="type" class="form-control" :class="{ 'is-invalid': form.errors.has('type') }">
                                    <option value="">Select User Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">Standard User</option>
                                    <option value="author">Author</option>
                                </select>
                                <has-error :form="form" field="type"></has-error>
                            </div>
                            <div class="form-group">
                                <textarea v-model="form.bio" name="bio" id="bio" placeholder="Short bio for user (Optional)"
                                    class="form-control" :class="{ 'is-invalid': form.errors.has('bio') }">
                                </textarea>
                                <has-error :form="form" field="bio"></has-error>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                            <button v-show="!updateMode" type="submit" class="btn btn-primary">Create</button>
                            <button v-show="updateMode" type="submit" class="btn btn-success">Update</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // users object
                users : {},
                // Create a new form instance
                form: new Form({
                    id: '',
                    name: '',
                    email: '',
                    password: '',
                    type: '',
                    bio: '',
                    photo: ''
                }),
                // updateMode is true by default
                updateMode: true
            }
        },
        methods: {
            displayUsers() {
                // axios is going to send GET request to api and return an object and assign it to this.users
                axios.get('api/user').then(({ data }) => (this.users = data.data));
            },
            createUser() {
                // Submit the form via a POST request to create a user
                this.$Progress.start(); // start the progressbar
                // send the post request to create the user
                this.form.post('api/user')
                // if successful
                .then(() => {
                    Fire.$emit('updateDisplay'); // fire a custom updateDisplay event
                    $('#addNew').modal('hide'); // hide the modal
                    toast.fire({
                        type: 'success',
                        title: 'User Created Successfully!'
                    }) // sweet alert for success
                    this.$Progress.finish(); // finish the progressbar
                })
                // if error
                .catch(() => {
                    toast.fire({
                        type: 'error',
                        title: 'User Creation Failed!'
                    }) // sweet alert for failure
                    this.$Progress.fail(); // fail the progressbar
                })
            },
            deleteUser(userId) {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                })
                .then((result) => {
                    // if confirmButton is clciked
                    if (result.value) {
                        // send request to the server to delete the user
                        this.form.delete('api/user/'+userId)
                        // if the delete request is successful
                        .then(() => {
                            // show the successful message
                            Swal.fire(
                                'Deleted!',
                                'User has been deleted.',
                                'success'
                            )
                            Fire.$emit('updateDisplay'); // fire a custom updateDisplay event
                        })
                        // if error
                        .catch(() => {
                            Swal.fire(
                                'Failed!',
                                'Something went wrong.',
                                'warning'
                            )
                        })
                    }
                })
            },
            updateUser() {
                this.$Progress.start(); // start the progressbar
                // send the update request to the api
                this.form.put('api/user/'+this.form.id)
                // if successful
                .then(() => {
                    Fire.$emit('updateDisplay'); // fire a custom updateDisplay event
                    $('#addNew').modal('hide'); // hide the modal
                    toast.fire({
                        type: 'success',
                        title: 'User Updated Successfully!'
                    }) // sweet alert for success
                    this.$Progress.finish(); // finish the progressbar
                })
                // if error
                .catch(() => {
                    toast.fire({
                        type: 'error',
                        title: 'User Updation Failed!'
                    }) // sweet alert for failure
                    this.$Progress.fail(); // fail the progressbar
                })
            },
            openModal() {
                this.updateMode = false // set updateMode to false
                this.form.clear(); // clear any errors
                this.form.reset(); // call the reset function of vform to reset the fields
                $('#addNew').modal('show'); // show the modal
            },
            openUpdateModal(user) {
                this.updateMode = true; // set updateMode to true
                this.form.clear(); // clear any errors
                this.form.reset(); // call the reset function of vform to reset the fields
                $('#addNew').modal('show'); // show the modal
                this.form.fill(user); // fill the modal with the user information
            }
        },
        mounted() {
            console.log('Component mounted.')
        },
        created() {
            this.$Progress.start(); // start the progressbar
            this.displayUsers(); // calling the displayUsers function
            this.$Progress.finish(); // finish the progressbar

            Fire.$on('updateDisplay', () => {
                this.displayUsers();
            }); // listen to the event updateDisplay and call displayUsers function
            //setInterval(() => this.displayUsers(), 3000); // calling displayUsers function every 3 secs
        }
    }
</script>
