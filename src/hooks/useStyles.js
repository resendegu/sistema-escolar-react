import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    div: {
        position: 'absolute',
        zIndex: 9,
        backgroundColor: '#f1f1f1',
        border: '1px solid #d3d3d3',
        textAlign: 'center',
    },

    header: {
        padding: '10px',
        cursor: 'move',
        zIndex: 10,
        backgroundColor: '#2196F3',
        color: '#fff',
    },
    navigationButtons: {
        justifyContent: 'space-around',
        width: '100%',
    },
    typography: {
        padding: theme.spacing(2),
      },
      fieldsContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingRight: "16px",
        flexWrap: "wrap",
      },
      backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        position: 'absolute',
      },
      avatar: {
        backgroundColor: theme.palette.primary,
      },
      formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
      },
      selectEmpty: {
        marginTop: theme.spacing(2),
      },
      fieldsSize: {
          minWidth: '270px',
      }
}));

export default useStyles;