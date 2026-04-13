import axiosInstance from "./AxiosConfig";

// ========profile==========


// HR creates employee
export const createEmployee = (data) =>
  axiosInstance.post("/finsecure/hr/employee/create", data);

export const getOwnProfile = () =>
    axiosInstance.get("/finsecure/employee/profile");

export const updateProfile = (data) =>
    axiosInstance.put("/finsecure/employee/update/profile",data);

export const getDashboard = () =>
    axiosInstance.get("/finsecure/employee/dashboard");

//=======photo======

export const uploadPhoto = (file) => {
    const formData  = new FormData();
    formData.append("file", file);
    return axiosInstance.post(
        "/finsecure/employee/profile/photo",
        formData,
        {headers: { "Content-Type": "multipart/form-data"} }
    );
};


//========education========

export const getMyEducation = () =>
    axiosInstance.get("/finsecure/employee/education");

export const addEducation = (data) =>
    axiosInstance.post("/finsecure/employee/education", data);

export const deleteEducation = (eduId) =>
    axiosInstance.delete('/finsecure/employee/education/${eduId}');

//========documents==========
export const getMyDocuments = () =>
    axiosInstance.get("/finsecure/employee/docuemnts");

export const uploadDocument = (documentType, documentNumber, file) => {
    const formData = new formData();
    formData.append("documentType", documentType);
    formData.append("documentNumber", documentNumber);
    formData.append("file", file);
    return axiosInstance.post(
        "/finsecure/employee/documents",
        formData,
        { headers: { "Content-Type": "multipart/form-data"} }
    );
};

//--------------rewards--------------

export const getMyRewards = () =>
    axiosInstance.get("/finsecure/employee/rewards");