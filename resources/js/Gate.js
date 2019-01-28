export default class Gate
{
    // constructor
    constructor(user)
    {
        this.user = user;
    }

    isAdmin()
    {
        return this.user.type === 'admin';
    }
    isUser()
    {
        return this.user.type === 'user';
    }
}