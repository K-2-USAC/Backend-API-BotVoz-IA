import Project from "./project.model.js";

export const createProject = async (req, res) => {
  try {
    const data = req.body;
    data.user = req.user._id;

    const project = await Project.create(data);

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { limit = 10, offset = 0, name } = req.query;
    const query = { status: true };

    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    const [total, projects] = await Promise.all([
      Project.countDocuments(query),
      Project.find(query)
        .skip(Number(offset))
        .limit(Number(limit))
    ]);

    return res.status(200).json({
      success: true,
      total,
      projects
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: id, status: true };

    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const project = await Project.findOne(query);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    return res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id, user, status, ...data } = req.body;
    
    const query = { _id: id, status: true };
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const project = await Project.findOneAndUpdate(
      query,
      data,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or not yours"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const query = { _id: id, status: true };
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const project = await Project.findOneAndUpdate(
      query,
      { status: false },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or not yours"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      project
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting project",
      error: error.message
    });
  }
};