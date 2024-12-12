import React, { useContext, useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, TextInput, Alert } from 'react-native';
import { GlobalStyles } from '../constants/styles';
import { ExpensesContext } from '../store/expenses-context';
import Button from '../components/UI/Button';
import IconButton from '../components/UI/IconButton';


function ManageExpense({ route, navigation }) {
  const expensesCtx = useContext(ExpensesContext);
  const editedExpenseId = route.params?.expenseId;
  const isEditing = !!editedExpenseId;

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isEditing) {
      const editedExpense = expensesCtx.expenses.find((expense) => expense.id === editedExpenseId);
      setDescription(editedExpense.description);
      setAmount(editedExpense.amount.toString());
      setDate(editedExpense.date.toISOString().split('T')[0]); 
      
    }
  }, [editedExpenseId, isEditing, expensesCtx.expenses]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Expense' : 'Add Expense',
    });
  }, [navigation, isEditing]);

  function deleteExpenseHandler() {
    expensesCtx.deleteExpense(editedExpenseId);
    navigation.goBack();
  }

  function cancelHandler() {
    navigation.goBack();
  }

  function confirmHandler() {
    if (!description.trim() || !amount.trim()) {
      Alert.alert('Invalid Input', 'Description and amount cannot be empty.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    const parsedDate = new Date(date);

    if(parsedAmount<0){
      Alert.alert('amount must be greater than 0');
      return;
    }

    // Date validation
    const currentDate = new Date();
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || parsedDate > currentDate) {
      Alert.alert('Invalid Date', 'Please enter a valid date in the format YYYY-MM-DD and not in the future.');
      return;
    }

    if (isEditing) {
      expensesCtx.updateExpense(editedExpenseId, { description, amount: parsedAmount, date: parsedDate });
    } else {
      expensesCtx.addExpense({ description, amount: parsedAmount, date: parsedDate });
    }

    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <View style={styles.buttons}>
        <Button style={styles.button} mode="flat" onPress={cancelHandler}>
          Cancel
        </Button>
        <Button style={styles.button} onPress={confirmHandler}>
          {isEditing ? 'Update' : 'Add'}
        </Button>
      </View>
      {isEditing && (
        <View style={styles.deleteContainer}>
          <IconButton
            icon="trash"
            color={GlobalStyles.colors.error500}
            size={36}
            onPress={deleteExpenseHandler}
          />
        </View>
      )}
    </View>
  );
}

export default ManageExpense;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.primary400,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 4,
    color: GlobalStyles.colors.textLight,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    minWidth: 120,
    marginHorizontal: 8,
  },
  deleteContainer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: GlobalStyles.colors.primary200,
    alignItems: 'center',
  },
});
