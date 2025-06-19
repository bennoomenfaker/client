import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Signin from './pages/auth/Signin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Page401 from './pages/Page401';
import Page404 from './pages/Page404';
import MinistryAdminPage from './pages/MinistryAdminPage';
import HospitalAdminPage from './pages/HospitalAdminPage';
import MaintenanceEngineerPage from './pages/MaintenanceEngineerPage';
import ServiceSupervisorPage from './pages/ServiceSupervisorPage';
import MaintenanceCompanyPage from './pages/MaintenanceCompanyPage';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { getProfile, logout } from './redux/slices/authSlice';
import ManageUserUpdateUser from './pages/user/ManageUserUpdateUser';
import ManageUserConsultUsers from './pages/user/ManageUserConsultUsers';
import ManageHospitalConsultListHospitals from './pages/hospitals/ManageHospitalConsultListHospitals';
import ManageHospitalConsultHospitalDetails from './pages/hospitals/ManageHospitalConsultHospitalDetails';
import EMDN_Nomenclature from './pages/equipment/EMDN_Nomenclature';
import ManageUserOfHospitalAdmins from './pages/user/HospitalAdmin/ManageUserOfHospitalAdmins';
import ManageHospitalCreateHospital from './pages/hospitals/ManageHospitalCreacteHospital';
import ManageUserCreateUser from './pages/user/ManageUserCreateUser';
import ManageUserModifyUser from './pages/user/ManageUseModifyUser';
import ManageHospitalUpdateHospital from './pages/hospitals/ManageHospitalUpdateHospital';
import ManageBrandsConsultListOfBrands from './pages/brands/ManageBrandsConsultListOfBrands';
import ManageBrandsCreateBrand from './pages/brands/ManageBrandsCreateBrand';
import ManageBrandsUpdateBrand from './pages/brands/ManageBrandsUpdateBrand';
import ManageEquipmentConsultListEquipment from './pages/equipment/ManageEquipmentConsultListEquipment';
import EquipmentComponent from './pages/equipment/MinistryOfHealth/EquipmentComponent';
import ManageEquipmentCreateNewEquipmentByMS from './pages/equipment/MinistryOfHealth/ManageEquipmentCreateNewEquipmentByMS';
import ConsultEquipmentByMS from './pages/equipment/MinistryOfHealth/ConsultEquipmentByMS';
import UpdateEquipmentByMS from './pages/equipment/MinistryOfHealth/UpdateEquipmentByMS';
import ManageServiceConsultList from './pages/servicesOfHospital/ManageServiceConsultList';
import ManageServiceCreateService from './pages/servicesOfHospital/ManageServiceCreateService';
import MangeServiceUpdateService from './pages/servicesOfHospital/MangeServiceUpdateService'
import ManageSparePartsCreateNewSpareParts from './pages/equipment/spareParts/ManageSparePartsCreateNewSpareParts';
import ManageSparePartsUpdateSpareParts from './pages/equipment/spareParts/ManageSparePartsUpdateSpareParts';
import AddEquipmentToHospital from './pages/equipment/AddEquipmentToHospital';
import TransferInterService from './pages/equipment/TransferInterService';
import TransfertInterHospital from './pages/equipment/TransfertInterHospital';
import NotificationsComponent from './components/NotificationsComponent';
import TrackMaintenance from './pages/maintenance/TrackMaintenance';
import EquipmentSpareParts from './components/SpareParts';
import ReportIncident from './pages/incident/ReportIncident';
import ConsultListIncident from './pages/incident/ConsultListIncident';
import UpdateIncident from './pages/incident/UpdateIncident';
import ConsultIncident from './pages/incident/ConsultIncident';
import VlalidateIncident from './pages/incident/VlalidateIncident';
import ConsultListOfCorectveMaintenanceByCompany from './pages/CorrectveMaintennace/ConsultListOfCorectveMaintenanceByCompany';
import UpdateMaintenanceCorrective from './pages/CorrectveMaintennace/UpdateMaintenanceCorrective';
import ConsultCoorectiveMaintenance from './pages/CorrectveMaintennace/ConsultCoorectiveMaintenance';
import ConsultSlaByProvider from './pages/SLA/ConsultSlaByProvider';
import ConsultOldTransfertEquipment from './pages/equipment/ConsultOldTransfertEquipment';
import ConsultListIncidentByMS from './pages/incident/ConsultListIncidentByMS';
import ManageSuplliersConsultListSuppliers from './pages/supplier/ManageSuplliersConsultListSuppliers';
import ManageSuppliersUpdateSupplier from './pages/supplier/ManageSuppliersUpdateSupplier';
import ConsultListOfSpareParts from './pages/equipment/spareParts/ConsultListOfSpareParts';
import ManageSparePartsCreateNewSparePart from './pages/equipment/spareParts/ManageSparePartsCreateNewSparePart';
import UpdateSpart from './pages/equipment/spareParts/UpdateSpart';
import ConsultSLAByHospitalId from './pages/SLA/ConsultSLAByHospitalId';
import UpdateSLA from './pages/SLA/UpdateSLA';
import ManageSuppliersCreateSupplier from './pages/supplier/ManageSuppliersCreateSupplier';

function App() {
  const profile = useSelector((state) => state.auth.user);
  const isAuth = profile !== null; // Vérifie si l'utilisateur est authentifié
  const dispatch = useDispatch()
  // Charger le profil utilisateur au montage
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await dispatch(getProfile()).unwrap();
      } catch (error) {
        if (error === "Token expired") {
          dispatch(logout());
        }
      }
    };

    fetchProfile();
  }, [dispatch]);
  return (
    <div className="app-body">
      <Routes>
        {/* Route racine */}
        <Route
          path="/"
          element={
            isAuth ? (
              profile.ministryAdmin ? <Navigate to="/ministry-admin" replace /> :
                profile.hospitalAdmin ? <Navigate to="/hospital-admin" replace /> :
                  profile.maintenanceEngineer ? <Navigate to="/maintenance-engineer" replace /> :
                    profile.serviceSupervisor ? <Navigate to="/service-supervisor" replace /> :
                      profile.maintenanceCompanyStaff ? <Navigate to="/maintenance-company" replace /> :
                        <Page401 /> // Aucun rôle valide
            ) : (
              <Signin />
            )
          }
        />

        {/* Routes publiques */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/401" element={<Page401 />} />
        <Route path="*" element={<Page404 />} />

        {/* Routes protégées */}
        <Route
          path="/ministry-admin"
          element={isAuth ? (profile.ministryAdmin ? <MinistryAdminPage /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/hospital-admin"
          element={isAuth ? (profile.hospitalAdmin ? <HospitalAdminPage /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/maintenance-engineer"
          element={isAuth ? (profile.maintenanceEngineer ? <MaintenanceEngineerPage /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/service-supervisor"
          element={isAuth ? (profile.serviceSupervisor ? <ServiceSupervisorPage /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/maintenance-company"
          element={isAuth ? (profile.maintenanceCompanyStaff ? <MaintenanceCompanyPage /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        {/* Route d'édition du compte utilisateur */}
        <Route
          path="/manage-users/manage-account/:id"
          element={
            isAuth ? <ManageUserUpdateUser /> : <Page401 />  // Accès à la page utilisateur si authentifié
          }
        />
        {/* Consulter la liste des utilisateurs by ministry  */}

        <Route
          path="/manage-users/consult-users-by-ms"
          element={isAuth ? (profile.ministryAdmin ? <ManageUserConsultUsers /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path="/manage-users/create-new-user"
          element={isAuth ? (profile.ministryAdmin || profile.hospitalAdmin ? <ManageUserCreateUser /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path="/manage-users/modify-user/:id"
          element={isAuth ? (profile.ministryAdmin || profile.hospitalAdmin ? <ManageUserModifyUser /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />



        <Route
          path="/manage-users/consult-users-by-hospital-admins"
          element={isAuth ? (profile.hospitalAdmin ? <ManageUserOfHospitalAdmins /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path="/manage-hospitals/consult-list-hospitals"
          element={isAuth ? (profile.ministryAdmin ? <ManageHospitalConsultListHospitals /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path="/manage-hospitals/create-new-hospital"
          element={isAuth ? (profile.ministryAdmin ? <ManageHospitalCreateHospital /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        < Route
          path="manage-hospitals/consult-hospital-details/:id"
          element={isAuth ? (profile.ministryAdmin ? <ManageHospitalConsultHospitalDetails /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path="/manage-hospitals/update-hospital/:id"
          element={isAuth ? (profile.ministryAdmin ? <ManageHospitalUpdateHospital /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />



        <Route
          path="/emdn-nomenclature"
          element={isAuth ? (profile.ministryAdmin || profile.hospitalAdmin || profile.maintenanceEngineer || profile.maintenanceCompanyStaff ? <EMDN_Nomenclature /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/manage-service/services"
          element={isAuth ? (profile.hospitalAdmin ? <ManageServiceConsultList /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/manage-service/create-new-service"
          element={isAuth ? (profile.hospitalAdmin ? <ManageServiceCreateService /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/manage-service/update-service/:id"
          element={isAuth ? (profile.hospitalAdmin ? <MangeServiceUpdateService /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path="/manage-equipment/equipments"
          element={isAuth ? (profile.ministryAdmin ? <EquipmentComponent /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
          <Route
          path="/manageSparePart/consultListSpareParts"
          element={isAuth ? (profile.hospitalAdmin || profile.maintenanceCompanyStaff || profile.maintenanceEngineer ? <ConsultListOfSpareParts /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        

        <Route
          path="manage-equipment/create-new-equipment"
          element={isAuth ? (profile.ministryAdmin ? <ManageEquipmentCreateNewEquipmentByMS /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path="/manage-brands/brands"
          element={isAuth ? (profile.hospitalAdmin ? <ManageBrandsConsultListOfBrands /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/manage-equipment/equipmentsOfHospital"
          element={isAuth ? (profile.hospitalAdmin || profile.maintenanceEngineer || profile.serviceSupervisor ? <ManageEquipmentConsultListEquipment /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/manage-equipment/consult-equipment/:serialCode"
          element={isAuth ? (profile.hospitalAdmin || profile.ministryAdmin || profile.maintenanceEngineer || profile.serviceSupervisor ? <ConsultEquipmentByMS /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/manage-equipment/update-equipment/:serialCode"
          element={isAuth ? (profile.hospitalAdmin || profile.ministryAdmin || profile.maintenanceEngineer || profile.serviceSupervisor || profile.maintenanceCompanyStaff? <UpdateEquipmentByMS /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path="/manage-brands/add-brand"
          element={isAuth ? (profile.hospitalAdmin ? <ManageBrandsCreateBrand /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path="/manage-brands/update-brand/:id"
          element={isAuth ? (profile.hospitalAdmin ? <ManageBrandsUpdateBrand /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path={`/manage-equipment/update-equipment/equipmentId/:id/addSpareParts`}
          element={isAuth ? (profile.hospitalAdmin ? <ManageSparePartsCreateNewSpareParts /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
         <Route
          path={`/manage-spareParts/addSparePart`}
          element={isAuth ? (profile.hospitalAdmin ? <ManageSparePartsCreateNewSparePart /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path={`/manage-equipment/update-equipment/equipmentId/:id/editSparePart`}
          element={isAuth ? (profile.hospitalAdmin ||profile.maintenanceEngineer || profile.maintenanceCompanyStaff ? <ManageSparePartsUpdateSpareParts /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path={`/manage-equipment/update-equipment/equipmentId/:id/editSpareParts`}
          element={isAuth ? (profile.hospitalAdmin ||profile.maintenanceEngineer ? <UpdateSpart /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path={`/manage-equipments/add-new-equipment-to-hospital`}
          element={isAuth ? (profile.hospitalAdmin ? <AddEquipmentToHospital /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path={`/manage-equipment/transferEquipmentInterService/:id`}
          element={isAuth ? (profile.hospitalAdmin || profile.serviceSupervisor ? <TransferInterService /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        <Route
          path={`/manage-equipment/transferEquipmentInterHospital/:id`}
          element={isAuth ? (profile.hospitalAdmin || profile.serviceSupervisor ? <TransfertInterHospital /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
         <Route
          path={`/manage-equipment/consultOldTransfertEquipment`}
          element={isAuth ? (profile.hospitalAdmin || profile.maintenanceEngineer ? <ConsultOldTransfertEquipment /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        
      <Route
          path={`/manage-supplier/suppliers`}
          element={isAuth ? (profile.hospitalAdmin || profile.maintenanceEngineer ? <ManageSuplliersConsultListSuppliers/> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path={`/notifications`}
          element={isAuth ? <NotificationsComponent /> : <Navigate to="/" replace />}
        />

        <Route
          path={`/manage-maintenance/trackMaintenance`}
          element={isAuth ? (profile.hospitalAdmin || profile.serviceSupervisor || profile.ministryAdmin ||profile.maintenanceEngineer || profile.maintenanceCompanyStaff ? <TrackMaintenance /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

        <Route
          path={`/manage-sparePart/:id`}
          element={isAuth ? (profile.hospitalAdmin || profile.serviceSupervisor || profile.ministryAdmin ? <EquipmentSpareParts /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
           <Route
          path={`/manage-incident/reportIncident/equipment/serialCode/:serialCode/equipmentId/:id`}
          element={isAuth ? (profile.hospitalAdmin || profile.serviceSupervisor || profile.ministryAdmin  ||profile.maintenanceEngineer ? <ReportIncident /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
         <Route
          path={`/manage-incident/consultListOfIncident`}
          element={isAuth ? (profile.hospitalAdmin || profile.serviceSupervisor || profile.ministryAdmin  ||profile.maintenanceEngineer ? <ConsultListIncident /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
         <Route
          path={`/manage-incident/updateIncident/:id`}
          element={isAuth ? (profile.hospitalAdmin || profile.serviceSupervisor || profile.ministryAdmin  ||profile.maintenanceEngineer ? <UpdateIncident /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
          <Route
          path={`/manage-incident/consulIncident/:id`}
          element={isAuth ? (profile.hospitalAdmin || profile.serviceSupervisor || profile.ministryAdmin  ||profile.maintenanceEngineer ? <ConsultIncident /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
          <Route
          path={`/manage-incident/validateIncident/:id`}
          element={isAuth ? (profile.hospitalAdmin || profile.serviceSupervisor || profile.ministryAdmin  ||profile.maintenanceEngineer ? <VlalidateIncident /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
         <Route
          path={`/manageCorrectiveMaintenance`}
          element={isAuth ? (profile.maintenanceCompanyStaff ? <ConsultListOfCorectveMaintenanceByCompany /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

<Route
          path={`/corrective-maintenance/update/:id`}
          element={isAuth ? (profile.maintenanceCompanyStaff || profile.hospitalAdmin || profile.maintenanceEngineer ? <UpdateMaintenanceCorrective /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        
<Route
          path={`/corrective-maintenance/consult/:id`}
          element={isAuth ? (profile.maintenanceCompanyStaff || profile.hospitalAdmin || profile.maintenanceEngineer ? <ConsultCoorectiveMaintenance /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

<Route
          path={`/manageSla/consltSlaByMaintennaceProvider`}
          element={isAuth ? (profile.maintenanceCompanyStaff  ? <ConsultSlaByProvider /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
     
     
<Route
          path={`/manageSla/consltSlaByMaintennaceByHospitalId`}
          element={isAuth ? (profile.hospitalAdmin || profile.maintenanceEngineer  ? < ConsultSLAByHospitalId /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
        
<Route
          path={`/manageSla/edit/:id/equipment/:serialCode`}
          element={isAuth ? (profile.hospitalAdmin || profile.maintenanceEngineer  ? < UpdateSLA /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />
     
        
<Route
          path={`manage-incident/consultListOfIncidentByMS`}
          element={isAuth ? (profile.ministryAdmin  ? <ConsultListIncidentByMS /> : <Navigate to="/401" replace />) : <Navigate to="/" replace />}
        />

<Route
  path="/manage-supplier/update-supplier/:id"
  element={
    isAuth
      ? (profile.hospitalAdmin || profile.maintenanceEngineer)
        ? <ManageSuppliersUpdateSupplier />
        : <Navigate to="/401" replace />
      : <Navigate to="/" replace />
  }
/>
<Route
  path="/manage-supplier/add"
  element={
    isAuth
      ? (profile.hospitalAdmin || profile.maintenanceEngineer)
        ? <ManageSuppliersCreateSupplier />
        : <Navigate to="/401" replace />
      : <Navigate to="/" replace />
  }
/>


        


      </Routes>



      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

    </div>
  );
}

export default App;




