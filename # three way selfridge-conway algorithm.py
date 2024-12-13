# three way selfridge-conway algorithm

# randomly generate three piecewise uniform value assignments
a, b, c = sorted(random.sample(range(1, 11), 5,)), sorted(random.sample(range(1, 11), 5,)), sorted(random.sample(range(1, 11), 5,))

# generate three slices of equal value according to agent a
initial_cuts = 0, cut_position(a, 1/3), cut_position(a, 2/3), 1
initial_slices = [(initial_cuts[i], initial_cuts[i+1]) for i in range(len(initial_cuts)-1)]

# generate evaluations from the perspective of agent b
initial_evaluations = [diff_eval(b, x) for x in initial_slices]

print(initial_evaluations)

highest_piece = np.argsort(initial_evaluations)[-1]
second_highest_piece = np.argsort(initial_evaluations)[-2]
second_highest_value = initial_evaluations[second_highest_piece]

print(second_highest_value)

for i in range(len(initial_slices)):
    print(f"{i}: {initial_slices[i]} = {initial_evaluations[i]}")

trim_start = cut_position(b, second_highest_value + evaluate(b, initial_slices[highest_piece][0]))



trim = trim_start, initial_slices[np.argsort(initial_evaluations)[-1]][1]


print(second_highest_value)
print(diff_eval(b, trim) / 3)

print("Total; " + str(second_highest_value + diff_eval(b, trim) / 3))
print("sliceslice; " + str( + diff_eval(b, trim) / 3))

initial_slices[highest_piece] = initial_slices[highest_piece][0], trim_start

c_slice = np.argmax([evaluate(c,slice[1]) - evaluate(c,slice[0]) for slice in initial_slices])

initial_allocations = [-1, -1, -1]
initial_allocations[2] = int(c_slice)


if c_slice == highest_piece:
    agent_t, agent_t_hat = 2,1
    initial_allocations[1] = int(second_highest_piece)
    initial_allocations[0] = [value for value in [0,1,2] if value not in initial_allocations][0]
else:
    agent_t, agent_t_hat = 1,2
    initial_allocations[1] = int(highest_piece)
    initial_allocations[0] = [value for value in [0,1,2] if value not in initial_allocations][0]


secondary_cuts = trim[0], diff_cut([a,b,c][agent_t_hat], 1/3, trim), diff_cut([a,b,c][agent_t_hat], 2/3, trim), trim[1]
secondary_slices = [(secondary_cuts[i], secondary_cuts[i+1]) for i in range(len(secondary_cuts)-1)]

print([diff_eval(b, x) for x in secondary_slices])

print(agent_t)

secondary_allocations = np.zeros(3, dtype=object)
remaining_slices = secondary_slices.copy()

for agent in [agent_t, 0, agent_t_hat]:
    preferences = [diff_eval([slice][0] if isinstance(slice, list) else slice, x) 
                   for x in remaining_slices]
    best_slice_index = np.argmax(preferences)
    
    secondary_allocations[agent] = remaining_slices[best_slice_index]
    remaining_slices[best_slice_index] = (1, 0)

initial_allocations = [initial_slices[x] for x in initial_allocations]

print(diff_eval(a, initial_allocations[0]) + diff_eval(a, secondary_allocations[0]))
print(diff_eval(b, initial_allocations[1]) + diff_eval(b, secondary_allocations[1]))
print(diff_eval(c, initial_allocations[2]) + diff_eval(c, secondary_allocations[2]))



