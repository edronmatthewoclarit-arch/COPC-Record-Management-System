// Logic that runs when the user route is triggered
exports.getUsers = (req, res) => {
    const sampleUsers = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ];
    res.json(sampleUsers);
};