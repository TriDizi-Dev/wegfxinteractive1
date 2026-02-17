import { DataGrid } from "@mui/x-data-grid";
import "./Managequestions.css";
import {
  Box,
  Button,
  IconButton,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, Link } from "react-router-dom";
import { ref, get, remove, database } from "../../../Firebase/firebase";
import { useEffect, useState } from "react";
import thinklogo from "../../../assets/AllWebpAssets/Asset3.webp";


const QuestionsManage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [rows, setRows] = useState([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      const questionsRef = ref(database, "questions");
      const snapshot = await get(questionsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedData = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setRows(formattedData);
      }
    };

    fetchQuestions();
  }, []);

  const deleteQuestion = async (id) => {
    try {
      await remove(ref(database, `questions/${id}`));
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  // Filtered rows by age group
  const filteredRows = selectedAgeGroup
    ? rows.filter((q) => q.age_group === selectedAgeGroup)
    : rows;

  // Compute category-wise counts from filtered rows
  const categoryCounts = {};
  filteredRows.forEach((q) => {
    const type = q.question_type || "Unknown";
    categoryCounts[type] = (categoryCounts[type] || 0) + 1;
  });

  const columns = [
    { field: "question", headerName: "Question", flex: 1, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "option1", headerName: "Option 1", flex: 1, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "option2", headerName: "Option 2", flex: 1, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "option3", headerName: "Option 3", flex: 1, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "option4", headerName: "Option 4", flex: 1, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "question_type", headerName: "Type", flex: 1, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "answer", headerName: "Answer", flex: 1, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "age_group", headerName: "Age Group", flex: 1, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      align: "center",
      headerAlign: "center",
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <IconButton onClick={() => deleteQuestion(params.row.id)}>
            <DeleteIcon sx={{ "&:active": { color: "#FFBF00" } }} />
          </IconButton>
          <IconButton component={Link} to={`/questionCreation/${params.row.id}`}>
            <EditIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <div className="Question_Main_container">
      <Box display="flex" justifyContent="space-between" alignItems="center" padding="1.5rem" flexWrap="wrap" marginTop="-2vw">
        <div className="logocontainer">
  <img src={thinklogo} className="logo1" />
</div>
        <h2 className="manage-title">Customised Questions</h2>
        <Button
          variant="contained"
          onClick={() => navigate("/questionCreation")}
          sx={{
            backgroundColor: "#937CB4",
            color: "#fff",
            fontWeight: "bold",
            textTransform: "none",
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            "&:hover": {
              backgroundColor: "#7a64a6",
            },
            marginTop: { xs: "1rem", md: 0 },
          }}
        >
          + Create Question
        </Button>
      </Box>

      <Box className="category-count-container">
        <Typography className="category-count-title">
          Category-wise Question Count
          <select
            className="Catogory_Selection_main"
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            value={selectedAgeGroup}
          >
            <option value="">All Age Groups</option>
            <option value="5-8">5–8 years</option>
            <option value="9-12">9–12 years</option>
            <option value="13-16">13–16 years</option>
          </select>
        </Typography>
        {Object.entries(categoryCounts).map(([cat, count]) => (
          <span className="category-count-item" key={cat}>
            {cat}: {count}
          </span>
        ))}
      </Box>

      {!isMobile ? (
        <Box m="1rem auto" height="64vh" width="95%" borderRadius="12px">
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id}
            rowHeight={40}
            sx={{
              textTransform: "capitalize",
              backgroundColor: "#fff",
              borderRadius: "12px",
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#937cb4 !important",
                color: "#ffffff !important",
                fontWeight: "bold",
                fontSize: "14px",
              },
              "& .MuiDataGrid-cell": {
                fontSize: "13px",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#f1eef6",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f8f4ff",
              },
              "& .MuiIconButton-root:hover": {
                backgroundColor: "#f3eaff",
                transform: "scale(1.05)",
                transition: "0.2s ease-in-out",
              },
            }}
          />
        </Box>
      ) : (
        <Box m="1rem auto" width="95%">
          {filteredRows.map((row) => (
            <Card key={row.id} sx={{ marginBottom: "1rem", background: "#fff3fc" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  Q: {row.question}
                </Typography>
                <Typography variant="body2">1. {row.option1}</Typography>
                <Typography variant="body2">2. {row.option2}</Typography>
                <Typography variant="body2">3. {row.option3}</Typography>
                <Typography variant="body2">4. {row.option4}</Typography>
                <Typography variant="body2" fontWeight="bold" mt={1}>
                  Type: {row.question_type} | Answer: {row.answer}
                </Typography>
                <Box display="flex" gap={2} mt={2}>
                  <Button
                    onClick={() => deleteQuestion(row.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Delete
                  </Button>
                  <Button
                    component={Link}
                    to={`/questionCreation/${row.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                  >
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </div>
  );
};

export default QuestionsManage;
