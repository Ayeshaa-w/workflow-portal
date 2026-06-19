const pool=require('../db');
const getAllRequests=async(req,res)=>{
    try{
        let result;
        if(req.user.role==='employee'){
        result=await pool.query(
            'SELECT * FROM requests WHERE submitted_by =$1 ORDER BY created_at DESC'[req.user.id]);}
            else{
                result=await pool.query(
                    'SELECT * FROM requests ORDER BY created_at DESC'
                );
            }
            res.status(200).json(result.rows);
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
};
const getRequestById = async(req,res)=>{
    try{
        const{id}=req.params;
        const result=await pool.query(
            'SELECT * FROM requests WHERE ID= $1',[id]
        );
        if (result.rows.length===0){
            return res.status(404).json({error:'Request not found'});
        }
        res.status(200).json(result.rows[0]);
    }
    catch(err){
        res.status(500).json({error :err.message});
    }
};
const createRequest = async (req, res) => {
    try {
        const { employee_name, type, description } = req.body;
        if (!employee_name || !type || !description) {
            return res.status(400).json({ error: 'All fields required' });
        }
        const result = await pool.query(
            'INSERT INTO requests (employee_name, type, description,submitted_by) VALUES ($1, $2, $3,$4) RETURNING *',
            [employee_name, type, description,req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const updateStatus =async(req,res)=>{
    try{
        const{id}=req.params;
        const{status}=req.body;
        if(!['approved','rejected','pending'].includes(status)){
            return res.status(400).json({error:'Invalid status'});
        }
        const result=await pool.query(
            'UPDATE requests SET status =$1 WHERE id = $2 RETURNING *',[status,id]
        );
        if (result.rows.length===0){
            return res.status(400).json({error:'Request not found'});
        }
        res.status(200).json(result.rows[0]);
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
};
const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM requests WHERE id = $1 RETURNING *', [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.status(200).json({ deleted: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports = {
    getAllRequests,
    getRequestById,
    createRequest,
    updateStatus,
    deleteRequest
};