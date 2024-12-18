import { pool } from "../config/database.js";


const getGroup = async (req, res) => {
    try{
        const sectaId = req.params.id;
        const [group] = await pool.query(`SELECT 
            secta_id as sectaId,
            secta_name as sectaName,
            secta_description as sectaDescription,
            secta_picture as sectaPicture,
            secta_banner as sectaBanner,
            creator_id as creatorId,
            updated_by as updatedBy,
            created_at as createdAt,
            updated_at as updatedAt
            FROM sectas
            WHERE secta_id = ?`, [sectaId]);
        if(group.length == 0){
            res.status(404).json({ message: "Group not found" });
        }
        res.json(group[0]);
    } catch (error) {
        res.status(500).json({ message: "Internal server error: ", error });
    }
}

const getGroups = async (req, res) => {
    try{
        const [groups] = await pool.query(`SELECT 
            secta_id as sectaId,
            secta_name as sectaName,
            secta_description as sectaDescription,
            secta_picture as sectaPicture,
            secta_banner as sectaBanner,
            creator_id as creatorId,
            updated_by as updatedBy,
            created_at as createdAt,
            updated_at as updatedAt
            FROM sectas`);
        
        res.json(groups);

    } catch (error) {
        res.status(500).json({ message: "Internal server error: ", error });
    }
};

const createGroup = async(req, res) => {
    try{
        const { sectaName, sectaDescription, sectaPicture, sectaBanner } = req.body;
        const userData = req.userData;
        await pool.query(`INSERT INTO sectas(secta_name, secta_description, secta_picture, secta_banner, creator_id, updated_by) VALUES (?, ?, ?, ?, ?, ?)`, [sectaName, sectaDescription, sectaPicture, sectaBanner, userData.id, userData.id]);
        
        res.status(200).json({message: "Group created successfully"});
    } catch (error) {
        res.status(500).json({ message: "Internal server error: ", error });
    } 
}

const updateGroup = async(req, res) => {
    try {
    const { sectaName, sectaDescription, sectaPicture, sectaBanner } = req.body;
    let params = [];
    let values = [];

    if (sectaName !== undefined) {
      params.push("secta_name");
      values.push(sectaName);
    }
    if (sectaDescription !== undefined) {
      params.push("secta_description");
      values.push(sectaDescription);
    }
    if (sectaPicture !== undefined) {
      params.push("secta_picture");
      values.push(sectaPicture);
    }
    if (sectaBanner !== undefined) {
      params.push("secta_banner");
      values.push(sectaBanner);
    }
    
    if(params.length == 0){
      return res.status(200).json({message: "Update completed"});
    }

    params.push("updated_by");
    values.push(req.userData.id);

    const groupId = req.params.id;

    function crearUpdateString(params, values) {
      let result = [];
    
      for (let i = 0; i < params.length; i++) {
        result.push(`${params[i]} = '${values[i]}'`);
      }
    
      return result.join(', ');
    }
    const data = crearUpdateString(params, values);

    const query =
      "UPDATE sectas SET " + data + " WHERE secta_id = ?";

    await pool.query(query, [groupId]);
    
    res.status(200).json({ message: "Group updated successfully"});

    } catch (error) {
        res.status(500).json({ message: "Internal server error: ", error });
    } 
}

export { getGroups, getGroup, createGroup, updateGroup }