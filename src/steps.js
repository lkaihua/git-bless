import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { connect } from "react-redux";

// const steps = [
//   {
//     title: 'Select campaign settings 2',
//     content: `For each ad campaign that you create, you can control how much
//               you're willing to spend on clicks and conversions, which networks
//               and geographical locations you want your ads to show on, and more.`,
//   },
//   {
//     title: 'Create an ad group 2',
//     content: 'An ad group contains one or more ads which target a shared set of keywords.',
//   },
//   {
//     title: 'Create an ad 2',
//     content: `Try out different ad text to see what brings in the most customers,
//               and learn how to enhance your ads using features like ad extensions.
//               If you run into any problems with your ads, find out how to tell if
//               they're running and how to resolve approval issues.`
//   },
// ];

// function getSteps(steps) {
//   return steps.map(step => step.title);
// }
// function getStepContent(steps, index) {
//   return steps[index].content;
// }

// function getSteps() {
//   return ['Select campaign settings', 'Create an ad group', 'Create an ad'];
// }

// function getStepContent(step) {
//   switch (step) {
//     case 0:
//       return `For each ad campaign that you create, you can control how much
//               you're willing to spend on clicks and conversions, which networks
//               and geographical locations you want your ads to show on, and more.`;
//     case 1:
//       return 'An ad group contains one or more ads which target a shared set of keywords.';
//     case 2:
//       return `Try out different ad text to see what brings in the most customers,
//               and learn how to enhance your ads using features like ad extensions.
//               If you run into any problems with your ads, find out how to tell if
//               they're running and how to resolve approval issues.`;
//     default:
//       return 'Unknown step';
//   }
// }

const styles = theme => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  actionsContainer: {
    marginBottom: theme.spacing.unit * 2,
  },
  resetContainer: {
    padding: theme.spacing.unit * 3,
  },
});

const updateActiveStep = step => ({
  type: "UPDATE_ACTIVE_STEP", 
  payload: step,
});

const mapDispatchToProps = dispatch => ({
  updateActiveStep: step => dispatch(updateActiveStep(step))
})

class VerticalLinearStepper extends React.Component {
  constructor() {
    super();
    this.state = {
      activeStep: 0,
    };
    
    this.handleNext = () => {
      this.setState(state => ({
        activeStep: state.activeStep + 1,
      }));
      this.props.updateActiveStep(this.state.activeStep + 1)
    };
  
    this.handleBack = () => {
      this.setState(state => ({
        activeStep: state.activeStep - 1,
      }));
      this.props.updateActiveStep(this.state.activeStep - 1)
    };
  
    this.handleReset = () => {
      this.setState({
        activeStep: 0,
      });
      this.props.updateActiveStep(0)
    };
  }
  
  render() {
    const { classes, steps } = this.props;
    // const steps = getSteps(content);
    const { activeStep } = this.state;

    // TODO: react binding patterns improved
    return (
      <div className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map(({label, content}) => {
            return (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  <Typography>{content}</Typography>
                  <div className={classes.actionsContainer}>
                    <div>
                      <Button
                        disabled={activeStep === 0}
                        onClick={this.handleBack}
                        className={classes.button}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleNext}
                        className={classes.button}
                      >
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                      </Button>
                    </div>
                  </div>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed.</Typography>
            <Button 
              variant="contained"
              color="default" 
              onClick={this.handleReset} 
              className={classes.button}
            >
              Reset
            </Button>
          </Paper>
        )}
      </div>
    );
  }
}


VerticalLinearStepper.propTypes = {
  classes: PropTypes.object,
  content: PropTypes.array
};

const connectedVerticalLinearStepper = connect(null, mapDispatchToProps)(VerticalLinearStepper);

export default withStyles(styles)(connectedVerticalLinearStepper);