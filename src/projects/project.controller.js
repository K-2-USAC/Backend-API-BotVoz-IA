import Project from "./project.model.js";
import User from "../user/user.model.js";

export const createProject = async (req, res) => {
  try {
    const data = req.body;
    data.user = req.user._id;

    // Deactivate all other projects for this user
    await Project.updateMany({ user: req.user._id }, { isActive: false });

    // The new project will automatically have isActive: true and the Twilio SID
    const project = await Project.create(data);

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message,
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

    let projectsQuery = Project.find(query)
      .skip(Number(offset))
      .limit(Number(limit));

    if (req.user.role === "admin") {
      projectsQuery = projectsQuery.populate("user", "name surname email");
    }

    const [total, projects] = await Promise.all([
      Project.countDocuments(query),
      projectsQuery.exec(),
    ]);

    return res.status(200).json({
      success: true,
      total,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
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
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message,
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

    const project = await Project.findOneAndUpdate(query, data, { new: true });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or not yours",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message,
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
      { new: true },
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or not yours",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting project",
      error: error.message,
    });
  }
};

export const activateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const query = { _id: id, status: true };
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const projectExists = await Project.findOne(query);

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Project not found or not yours",
      });
    }

    // Deactivate all projects for this user
    await Project.updateMany({ user: projectExists.user }, { isActive: false });

    // Activate the selected project
    const project = await Project.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Project activated successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error activating project",
      error: error.message,
    });
  }
};
