const express = require('express');
const router = express.Router();
const Member = require('../models/member');

router.get('/', (req, res) => {
    const memberModel = new Member(req.app.locals.db);
    const includeInactive = req.query.include_inactive === 'true';
    const members = memberModel.findAll(includeInactive);
    
    res.render('members/index', { 
        title: 'Library Members',
        members,
        includeInactive
    });
});

router.get('/new', (req, res) => {
    res.render('members/form', { 
        title: 'Add New Member',
        member: null,
        action: '/members'
    });
});

router.get('/:id/edit', (req, res) => {
    const memberModel = new Member(req.app.locals.db);
    const member = memberModel.findById(req.params.id);
    
    if (!member) {
        return res.status(404).send('Member not found');
    }

    res.render('members/form', { 
        title: 'Edit Member',
        member,
        action: `/members/${member.id}`
    });
});

router.post('/', (req, res) => {
    const memberModel = new Member(req.app.locals.db);
    
    try {
        memberModel.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            membership_date: req.body.membership_date || new Date().toISOString().split('T')[0],
            status: 'active'
        });
        res.redirect('/members');
    } catch (error) {
        res.status(400).send(`Error creating member: ${error.message}`);
    }
});

router.post('/:id', (req, res) => {
    const memberModel = new Member(req.app.locals.db);
    
    try {
        memberModel.update(req.params.id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            status: req.body.status
        });
        res.redirect('/members');
    } catch (error) {
        res.status(400).send(`Error updating member: ${error.message}`);
    }
});

router.post('/:id/deactivate', (req, res) => {
    const memberModel = new Member(req.app.locals.db);
    
    try {
        memberModel.deactivate(req.params.id);
        res.redirect('/members');
    } catch (error) {
        res.status(400).send(`Error deactivating member: ${error.message}`);
    }
});

router.post('/:id/delete', (req, res) => {
    const memberModel = new Member(req.app.locals.db);
    
    try {
        memberModel.delete(req.params.id);
        res.redirect('/members');
    } catch (error) {
        res.status(400).send(`Error deleting member: ${error.message}`);
    }
});

module.exports = router;
