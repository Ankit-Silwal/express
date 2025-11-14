export const createUserValidationSchema={
  username:{
    isLength:{
      options:{
        min:5,
        max:32,
      },
      errorMessage:
        "Username must be at least 5 characters with max of 32 characters "
    },
    notEmpty:{
      errorMessage:"Username cannt be empty",
    },
    isString:{
      errorMessage:"Username must be a string",
    },
  },
  displayName:{
    notEmpty:true,
  }
}
export const createQueryValidationSchema = {
  filter: {
    optional: true,          
    isString: {
      errorMessage: "Filter must be a string",
    },
    isLength: {
      options: { min: 3, max: 30 },
      errorMessage: "Filter length must be 3–30 characters",
    },
  },

  value: {
    optional: true,           
    isString: {
      errorMessage: "Value must be a string",
    },
    isLength: {
      options: { min: 1 },
      errorMessage: "Value must not be empty",
    }
  },
};
