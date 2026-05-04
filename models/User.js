class User {
    constructor(userId, firstName, lastName, email, password, userRole) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.userRole = userRole; // admin/manager/user
        this.createDate = new Date().toISOString();
        this.updateDate = new Date().toISOString();
    }

    

    getFullName() {
        return this.firstName + ' ' + this.lastName;
    }

    isAdmin() {
        return this.userRole === 'admin';
    }
}

module.exports = User;
